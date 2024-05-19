import { world, system, EquipmentSlot, ItemDurabilityComponent, ItemStack, EntityEquippableComponent, EntityInventoryComponent, Container, BlockPermutation, Block } from "@minecraft/server"
const list = ['wheat', 'carrots', 'potatoes', 'nether_wart', 'beetroot']

world.beforeEvents.itemUse.subscribe(data => {
    const { source, itemStack } = data
    if (itemStack.typeId.endsWith("_hoe")) {
        try {
            const equippable = source.getComponent("equippable")
            const item = equippable?.getEquipment(EquipmentSlot.Mainhand)
            /** @type {Block} */
            const { block } = source.getBlockFromViewDirection()

            if (block) {
                let level = 7
                let growth = block.permutation.getState("growth") || block.permutation.getState("age")
                if (!growth) return
                if (block.permutation.matches("minecraft:nether_wart")) level = 3

                if (growth >= level) {
                    system.run(() => {
                        /** @type {ItemDurabilityComponent} */
                        let dur = item.getComponent("durability")
                        if (dur.maxDurability - dur.damage === 0) {
                            source.runCommandAsync(`clear @s ${itemStack.typeId} ${dur.damage} 1`)
                            source.runCommandAsync(`playsound random.break @a ~~~`)
                        } else {
                            dur.damage += 1
                        }
                        let typeId = list.find(it => block.permutation.matches(`minecraft:${it}`))
                        source.runCommandAsync(`setblock ${block.x} ${block.y} ${block.z} minecraft:${typeId} destroy`)
                        equippable?.setEquipment(EquipmentSlot.Mainhand, item)
                    })
                }
            }
        } catch (e) { }
    }
})

world.beforeEvents.playerBreakBlock.subscribe(data => {
    try {
        const { player, itemStack, block } = data
        let id = list.find(it => block.permutation.matches(`minecraft:${it}`))
        if (!itemStack) return
        if (itemStack.typeId.endsWith("_hoe")) {
            /** @type {EntityEquippableComponent} */
            const equippable = player.getComponent("equippable")
            /** @type {ItemStack} */
            const item = equippable?.getEquipment(EquipmentSlot.Mainhand)

            if (block) {
                let level = 7
                let growth = block.permutation.getState("growth") || block.permutation.getState("age")
                if (!growth) return
                if (block.permutation.matches("minecraft:nether_wart")) level = 3
                if (growth >= level) {
                    system.run(() => {
                        /** @type {ItemDurabilityComponent} */
                        let dur = item.getComponent("durability")
                        if (dur.maxDurability - dur.damage === 0) {
                            /** @type {Container} */
                            player.runCommandAsync(`clear @s ${itemStack.typeId} ${dur.damage} 1`)
                            player.runCommandAsync(`playsound random.break @a ~~~`)
                        } else {
                            dur.damage += 1
                        }
                        player.runCommandAsync(`setblock ${block.x} ${block.y} ${block.z} minecraft:${id}`)
                        equippable?.setEquipment(EquipmentSlot.Mainhand, item)
                    })
                }
            }
        }
    } catch (e) { }
})