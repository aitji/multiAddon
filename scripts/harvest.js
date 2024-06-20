import { world, system, EquipmentSlot, ItemDurabilityComponent, ItemStack, EntityEquippableComponent, EntityInventoryComponent, Container, BlockPermutation, Block } from "@minecraft/server"
import { AFTER_BREAK } from "./_function"
import { get } from "./main"
const list = ['wheat', 'carrots', 'potatoes', 'nether_wart', 'beetroot']
const ID = 'harvest'

world.beforeEvents.playerBreakBlock.subscribe(data => {
    if (!get(ID)) return
    const { player, itemStack, block } = data
    let id = list.find(it => block.permutation.matches(`minecraft:${it}`))
    if (!itemStack) return
    if (itemStack.typeId.endsWith("_hoe")) {
        /** @type {EntityEquippableComponent} */
        const equippable = player.getComponent("equippable")
        /** @type {ItemStack} */
        let item = equippable?.getEquipment(EquipmentSlot.Mainhand)

        if (block) {
            let level = 7
            let growth = block.permutation.getState("growth") || block.permutation.getState("age")
            if (!growth) {
                if (!player.isSneaking) {
                    system.run(() => player.setDynamicProperty(`§o§ฟ§7sneak & break to fully destroy!`, 3))
                    data.cancel = true
                }
                return
            }
            if (block.permutation.matches("minecraft:nether_wart")) level = 3
            if (growth >= level) {
                system.run(() => {
                    /** @type {ItemDurabilityComponent} */
                    let dur = item.getComponent("durability")
                    if (dur.maxDurability - dur.damage === 0) {
                        item = AFTER_BREAK
                        player.runCommandAsync(`playsound random.break @a ~~~`)
                        return
                    } else dur.damage += 1
                    player.dimension.getBlock(block.location).setPermutation(BlockPermutation.resolve(`minecraft:${id}`))
                    equippable?.setEquipment(EquipmentSlot.Mainhand, item)
                })
            } else {
                if (!player.isSneaking) {
                    system.run(() => player.setDynamicProperty(`actionbar§:§o§ฟ§7sneak & break to fully destroy! §r§7| it not growth yet!`, 3))
                    data.cancel = true
                }
            }
        }
    }
})