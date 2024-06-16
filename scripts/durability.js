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
        if (!equippable) return
        for (let i = 0; i < equipmentSlots.length; i++) {
            const slot = equipmentSlots[i]
            /** @type {ItemStack} */
            const item = equippable.getEquipment(slot)
            if (!item) return

            /** @type {ItemDurabilityComponent} */
            const durability = item.getComponent("durability")
            if (!durability) return

            const remainingDurability = durability.maxDurability - durability.damage
            if (i === len) player.setDynamicProperty(`actionbar§:${item.nameTag || reName(item.typeId)} §7(${remainingDurability}/${durability.maxDurability})`, 1)
        }
    })
}, 20)