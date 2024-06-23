import { world, system, EquipmentSlot, ItemDurabilityComponent, ItemStack, EntityEquippableComponent } from "@minecraft/server"
import { reName } from "./_function"
import { get } from "./main"
const ID = 'durability'
const style = world.getDynamicProperty(ID) || '§f{name} §7({remain}/{max})'
// /\{name\}/g
/** @returns {String} */
const rep = (input, re, replace) => input.replace(new RegExp(`\\{${re}\\}`, 'g'), replace)

const equipmentSlots = [
    EquipmentSlot.Head,     // #0 //
    EquipmentSlot.Chest,    // #1 //
    EquipmentSlot.Legs,     // #2 //
    EquipmentSlot.Feet,     // #3 //
    EquipmentSlot.Offhand,  // #4 //
    EquipmentSlot.Mainhand  // #5 //
]

system.runInterval(() => {
    if (!get(ID)) return
    const players = world.getAllPlayers()
    for (const player of players) {
        const equippable = player.getComponent("equippable")
        if (!equippable) continue
        for (let i = 0; i < equipmentSlots.length; i++) {
            const slot = equipmentSlots[i]
            /** @type {ItemStack} */
            const item = equippable?.getEquipment(slot)
            const durability = item?.getComponent("durability")
            if (!item || !durability) continue

            const remain = durability?.maxDurability - durability?.damage
            let actionbar = rep(style, `name`, item?.nameTag || reName(item?.typeId))
            actionbar = rep(actionbar, `remain`, remain)
            actionbar = rep(actionbar, `max`, durability?.maxDurability)
            if (slot === EquipmentSlot.Mainhand) player.setDynamicProperty(`actionbar§:${actionbar}`, 20)
        }
    }
}, 20)