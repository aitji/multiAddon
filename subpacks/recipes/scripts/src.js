import { world, system, BlockPermutation, Container, ItemStack, Player, Block } from "@minecraft/server"
const debug = false
if (debug) world.sendMessage('§7(debug) script reloaded')
import "./main.js"
world.getDimension('overworld').runCommandAsync(`gamerule sendcommandfeedback false`)

world.beforeEvents.itemUseOn.subscribe(data => {
    const { source, itemStack, block } = data
    if (!block || !itemStack) return
    try {
        system.run(() => {
            if (block.permutation.getState("cauldron_liquid") === "water" && block.permutation.getState("fill_level") >= 1) {
                let found = 0
                found += wash(
                    source, itemStack, block,
                    "minecraft:cobbled_deepslate", 1,
                    "minecraft:cobblestone", 1
                ) || 0

                if (itemStack.typeId.endsWith('_concrete_powder') && itemStack.typeId === `minecraft:${itemStack.typeId.split("minecraft:")[1].split("_concrete_powder")[0]}_concrete_powder` && itemStack?.amount >= 1) {
                    let color = itemStack.typeId.split("minecraft:")[1].split("_concrete_powder")[0]
                    found += 1
                    source.runCommandAsync(`clear @s minecraft:${color}_concrete_powder 0 1`)
                    source.runCommandAsync(`give @s minecraft:${color}_concrete 1`)
                    let loc = block.location
                    loc = { x: loc.x, y: loc.y + 0.8, z: loc.z }
                    for (let i = 0; i < 4; i++) source.dimension.spawnParticle(`minecraft:water_splash_particle`, loc)
                    source.runCommandAsync(`playsound cauldron.takewater @a ${block.location.x} ${block.location.y + 1} ${block.location.z}`)
                }

                if (found >= 1) block.setPermutation(block.permutation.withState('fill_level', block.permutation.getState('fill_level') - 1))
            }
        })
    } catch (error) { return }
})

/**
 * @param {Player} source
 * @param {ItemStack} itemStack
 * @param {Block} block
 */
function wash(source, itemStack, block, wash, takenWash = 1, newItem, newItemGot = 1) {
    let found = 0
    if (itemStack.typeId === wash && itemStack?.amount >= takenWash) {
        let loc = block.location
        loc = { x: loc.x, y: loc.y + 0.8, z: loc.z }
        found = 1
        source.runCommandAsync(`clear @s ${wash} 0 ${takenWash}`)
        source.runCommandAsync(`give @s ${newItem} ${newItemGot}`)
        for (let i = 0; i < 4; i++) source.dimension.spawnParticle(`minecraft:water_splash_particle`, loc)
        source.runCommandAsync(`playsound cauldron.takewater @a ${block.location.x} ${block.location.y + 1} ${block.location.z}`)
    } else found = 0

    return found
}