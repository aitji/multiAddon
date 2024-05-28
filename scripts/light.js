import { ItemStack, world, system, EntityEquippableComponent, EquipmentSlot, BlockPermutation, BlockStates, Block, Player, MinecraftDimensionTypes } from "@minecraft/server"
import { DEBUG, isFrame } from "./_function"
// https://minecraft.wiki/w/Light#Light-emitting_blocks

const DELAY = 0 /** delay for everything (0 is good) */
const DECAY_LIGHT_TICK = 3 /** before light when off time (delay*decay) | (3) */
const REDUCE_LIGHT = 0.8 /** lightLevel * REDUCE_LIGHT | (0.8) */
const ENTITY_RENDER_DISTANT_BLOCK = 32 /** block that entity load from player (32) */

if (DEBUG) world.sendMessage(`§c* WARNING, you're enable debug mode please disable before publish!`)

const light = {
    "beacon": { light: 15 },
    "campfire": { light: 15 },
    "conduit": { light: 15 },
    "ochre_froglight": { light: 15 },
    "pearlescent_froglight": { light: 15 },
    "verdant_froglight": { light: 15 },
    "glowstone": { light: 15 },
    "lit_pumpkin": { light: 15 },
    "lantern": { light: 15 },
    "lava_bucket": { light: 15 },
    "sea_lantern": { light: 15 },
    "shroomlight": { light: 15 },
    "end_rod": { light: 14 },
    "glow_berries": { light: 14 },
    "torch": { light: 14 },
    "crying_obsidian": { light: 10 },
    "soul_campfire": { light: 10 },
    "soul_lantern": { light: 10 },
    "soul_torch": { light: 10 },
    "enchanting_table": { light: 7 },
    "ender_chest": { light: 7 },
    "glow_lichen": { light: 7 },
    "redstone_torch": { light: 7 },
    "sculk_catalyst": { light: 6 },
    "sea_pickle": { light: 6, inLiquid: true },
    "vault": { light: 6 },
    "amethyst_cluster": { light: 5 },
    "large_amethyst_bud": { light: 4 },
    "trial_spawner": { light: 4 },
    "magma": { light: 3 },
    "medium_amethyst_bud": { light: 2 },
    "brewing_stand": { light: 1 },
    "brown_mushroom": { light: 1 },
    "calibrated_sculk_sensor": { light: 1 },
    "dragon_egg": { light: 1 },
    "end_portal_frame": { light: 1 },
    "sculk_sensor": { light: 1 },
    "small_amethyst_bud": { light: 1 }
}
/** @param {Player} en */
const processEntity = (en, isPlayer = false) => {
    try {
        if (isPlayer) en.dimension.getEntities({ maxDistance: ENTITY_RENDER_DISTANT_BLOCK || 64, location: en.location, type: 'minecraft:item' }).forEach(enr => processEntity(enr))

        let item = isPlayer ? en.getComponent("equippable")?.getEquipment(EquipmentSlot.Mainhand) : en.getComponent("item").itemStack
        if (!item) return
        const typeId = item.typeId.split('minecraft:')[1].toLowerCase()
        const type = light[typeId]
        if (!type || typeof type.light !== 'number') return
        let lightLevel = Math.min(15, Math.ceil(type.light * REDUCE_LIGHT))
        let block = en.dimension.getBlock(en.location)
        let directions = ['east', 'west', 'north', 'south', '']
        directions.forEach(dir => {
            let blo = dir ? block[dir](-1) : block
            let checkAndPut = blo => { if (blo.isLiquid || blo.isAir || blo.permutation.matches("minecraft:light_block")) put_light(blo, lightLevel, en) }
            for (let i = 0; i < 3; i++) {
                checkAndPut(blo)
                blo = blo.offset({ x: 0, y: 1, z: 0 })
            }
        })
    } catch (error) { }
}

system.runInterval(() => {
    world.getDynamicPropertyIds().forEach(dy => {
        if (dy.startsWith("light:")) {
            let [_, dim, x, y, z, level, liq] = dy.split(":")
            liq = liq === 'true'
            let time = world.getDynamicProperty(dy)
            const block = world.getDimension(dim).getBlock({ x: +x, y: +y, z: +z })
            const normalLight = BlockPermutation.resolve('minecraft:light_block').withState('block_light_level', +level)

            try {
                if (time < 0) {
                    const lig = block.permutation.getState("block_light_level")
                    if (lig <= 0) {
                        world.setDynamicProperty(dy, undefined)
                        const air = liq ? BlockPermutation.resolve('minecraft:water') : BlockPermutation.resolve('minecraft:air')
                        if (block.isAir || (liq && block.isLiquid) || block.permutation.matches('minecraft:light_block')) block.setPermutation(air)
                        return
                    }
                    const state = BlockPermutation.resolve('minecraft:light_block').withState('block_light_level', lig - 1)
                    if (block.isAir || (liq && block.isLiquid) || block.permutation.matches('minecraft:light_block')) block.setPermutation(state)
                    world.setDynamicProperty(dy, time - 1)
                    return
                }
                if (block.isAir || (liq && block.isLiquid) || block.permutation.matches('minecraft:light_block')) block.setPermutation(normalLight)
                world.setDynamicProperty(dy, time - 1)
            } catch {
                world.setDynamicProperty(dy, undefined)
            }
        } else if (dy.startsWith('frame:')) {
            try {
                let [_, dim, x, y, z] = dy.split(":")
                let block = world.getDimension(dim).getBlock({ x: +x, y: +y, z: +z })
                if (!block || block.permutation.matches('minecraft:air')) {
                    world.setDynamicProperty(dy, undefined)
                    if (DEBUG) world.sendMessage(`§cclear: §7${dy} §8invaild block L`)
                    return
                }
                let item = block.getItemStack(1)
                if (!item) return
                let typeId = item.typeId.split('minecraft:')[1].toLowerCase()
                let type = light[typeId]
                if (!type || typeof type.light !== 'number') return
                let lightLevel = Math.max(0, Math.min(15, Math.ceil(type.light * REDUCE_LIGHT)))
                let directions = ['east', 'west', 'north', 'south', '']
                directions.forEach(dir => {
                    let blo = dir ? block[dir](-1) : block
                    for (let i = 0; i < 3; i++) {
                        if (blo.isLiquid || blo.isAir || blo.permutation.matches("minecraft:light_block")) put_light(blo, lightLevel, Infinity, true)
                        blo = blo.offset({ x: 0, y: 1, z: 0 })
                    }
                })
            } catch { }
        }
    })
    world.getAllPlayers().forEach(pl => processEntity(pl, true))
}, DELAY)

/** @param {Block} block @param {Number} level @param {Player} pl @param {boolean} force   */
function put_light(block, level, pl, force = false) {
    try {
        let set = `light:${block.dimension.id.split(":")[1]}:${block.location.x}:${block.location.y}:${block.location.z}:${level}:${block.permutation.matches("minecraft:water")}:${force ? pl : (pl.id || pl.name || pl.nameTag || pl.typeId)}`
        if (!world.getDynamicProperty(set) && block.permutation.matches("minecraft:light_block")) return
        if (block.isLiquid) if (block.permutation.getState('liquid_depth') !== 0) return
        let state = BlockPermutation.resolve('minecraft:light_block').withState('block_light_level', Number(level))
        world.getDimension(block.dimension.id).getBlock(block.location).setPermutation(state)
        if (!world.getDynamicProperty(set)) world.setDynamicProperty(set, DECAY_LIGHT_TICK)
    } catch (e) { }
}

world.afterEvents.entityRemove.subscribe(data => {
    const { removedEntityId } = data
    world.getDynamicPropertyIds().forEach(dy => {
        if (dy.startsWith("light:") && dy.split(":")[7].toString() === removedEntityId.toString()) {
            if (dy.split(':')[6] === 'true') world.getDimension(dy.split(':')[1]).runCommandAsync(`setblock ${dy.split(':')[2]} ${dy.split(':')[3]} ${dy.split(':')[4]} water`)
            else world.getDimension(dy.split(':')[1]).runCommandAsync(`setblock ${dy.split(':')[2]} ${dy.split(':')[3]} ${dy.split(':')[4]} air`)
            world.setDynamicProperty(dy, undefined)
        }
    })
})

world.afterEvents.playerPlaceBlock.subscribe(data => {
    const { block } = data
    if (isFrame(block)) {
        let bl = `frame:${block.dimension.id.split(":")[1]}:${block.location.x}:${block.location.y}:${block.location.z}`
        if (DEBUG) world.sendMessage(`§aadd:§7 ${bl}`)
        world.setDynamicProperty(bl, 1)
    }
})

world.beforeEvents.playerBreakBlock.subscribe(data => {
    const { block } = data
    if (isFrame(block)) {
        let bl = `frame:${block.dimension.id.split(":")[1]}:${block.location.x}:${block.location.y}:${block.location.z}`
        if (DEBUG) world.sendMessage(`§4break:§7 ${bl}`)
        world.setDynamicProperty(bl, undefined)
    }
})

if (DEBUG) {
    world.afterEvents.itemUse.subscribe(data => {
        const { itemStack } = data
        if (itemStack.typeId === 'minecraft:barrier') {
            world.getDynamicPropertyIds().map(dy => world.sendMessage(`§7${dy}`))
            world.clearDynamicProperties()
        }
    })
}