import { Container, EntityComponentTypes, EntityEquippableComponent, EntityInventoryComponent, EquipmentSlot, ItemStack, system, world } from "@minecraft/server";
import { light, reName } from "./_function";
import { get } from "./main";

world.beforeEvents.itemUse.subscribe(data => {
    const setting = world.getDynamicProperty('setting')
    if (!setting || setting.charAt(8) === '0') return

    const { source, itemStack: item } = data
    if (!item || !source.isSneaking) return

    /** @type {ItemStack} */
    const oHand = source.getComponent("equippable")?.getEquipment(EquipmentSlot.Offhand)
    if (oHand && oHand?.typeId !== item?.typeId) source.setDynamicProperty('actionbar§:§r§7You already have an item in offhand', 3)
    else {
        const typeId = item.typeId?.split('minecraft:')[1]?.toLowerCase()
        if (typeId && light[typeId]) {
            const count = (oHand?.amount || 0) + 1
            source.setDynamicProperty(`actionbar§:§r§7You just wore: ${reName(item?.typeId)} x${count}`, 3)
            source.runCommandAsync(`clear @s ${item.typeId} 0 1`)
            const target = get('inv') ? '@a' : '@s'
            source.runCommandAsync(`replaceitem entity ${target} slot.weapon.offhand 0 ${item.typeId} ${count}`)
            data.cancel = true
        } else source.setDynamicProperty('actionbar§:§r§7Only support dynamic light items', 3)
    }
})