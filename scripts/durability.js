import { world, system, EquipmentSlot, ItemDurabilityComponent, ItemStack, EntityEquippableComponent } from "@minecraft/server"
import { reName } from "./_function"

const equipmentSlots = [
    EquipmentSlot.Head,
    EquipmentSlot.Chest,
    EquipmentSlot.Legs,
    EquipmentSlot.Feet,
    EquipmentSlot.Offhand,
    EquipmentSlot.Mainhand
]
const len = equipmentSlots.length - 1

system.runInterval(() => {
    const players = world.getAllPlayers()
    players.forEach(player => {
        /** @type {EntityEquippableComponent} */
        const equippable = player.getComponent("equippable")
        if (!equippable) {
            return
        }

        equipmentSlots.forEach((slot, i) => {
            /** @type {ItemStack} */
            const item = equippable.getEquipment(slot)
            if (!item) {
                return
            }

            /** @type {ItemDurabilityComponent} */
            const durability = item.getComponent("durability")
            if (!durability) {
                return
            }

            let hold = player.getDynamicProperty('hold') || ''
            if (!hold) hold = 'minecraft:air§|0'
            const holdType = hold.split("§|")[0] || ''
            const holdTime = Number(hold.split("§|")[1]) || 0

            const remainingDurability = durability.maxDurability - durability.damage

            if (holdTime >= 4) system.run(() => {
                if (i === len) player.setDynamicProperty(`actionbar§:${item.nameTag || reName(item.typeId)} §7(${remainingDurability}/${durability.maxDurability})`, 1)
                player.setDynamicProperty('hold', `${item.typeId}§|4`)
            })

            player.setDynamicProperty('hold', `${item.typeId}§|${holdTime + 1}`)
        })
    })
}, 20)