import { world, system, EquipmentSlot, ItemDurabilityComponent, ItemStack, EntityEquippableComponent } from "@minecraft/server"
import { reName } from "./_function"
import { get } from "./main"
const ID = 'durability'

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
    if (!get(ID)) return
    const players = world.getAllPlayers()
    for (const player of players) {

        /** @type {EntityEquippableComponent} */
        const equippable = player.getComponent("equippable")
        if (!equippable) continue
        for (let i = 0; i < equipmentSlots.length; i++) {
            const slot = equipmentSlots[i]
            /** @type {ItemStack} */
            const item = equippable.getEquipment(slot)
            if (!item) continue

            /** @type {ItemDurabilityComponent} */
            const durability = item.getComponent("durability")
            if (!durability) continue

            const remainingDurability = durability.maxDurability - durability.damage
            if (slot === EquipmentSlot.Mainhand) player.setDynamicProperty(`actionbar§:${item.nameTag || reName(item.typeId)} §7(${remainingDurability}/${durability.maxDurability})`, 1)
        }
    }
}, 20)