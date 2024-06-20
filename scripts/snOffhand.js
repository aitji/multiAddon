import { EquipmentSlot, world } from "@minecraft/server";
import { light } from "./_function";
import { get } from "./main";
const ID = 'snOffhand'
world.beforeEvents.itemUse.subscribe(data => {
    if (!get(ID)) return
    const { source, itemStack: item } = data
    let itemStack = item
    if (item) {
        if (!source.isSneaking) return
        const off = source.getComponent("equippable")?.getEquipment(EquipmentSlot.Offhand)
        if (off) source.setDynamicProperty(`actionbar§:§r§7you already have item in offhand`, 3)
        else {
            const ty = itemStack?.typeId?.split('minecraft:')[1].toLowerCase()
            if (light[ty]) {
                source.setDynamicProperty(`actionbar§:§r§7you just wear: ${ty}`, 3)
                source.runCommandAsync(`clear @s ${item.typeId} 0 1`)
                source.runCommandAsync(`replaceitem entity @s slot.weapon.offhand 0 ${item.typeId} 1`)
                data.cancel = true
            } else source.setDynamicProperty(`actionbar§:§r§7only support dynamic light item`, 3)
        }
    }
})