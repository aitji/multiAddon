import {
    world, system, EquipmentSlot,
    ItemDurabilityComponent, ItemStack, EntityEquippableComponent
} from "@minecraft/server"
world.getAllPlayers().map(plr => plr.getDynamicPropertyIds().filter(dy => dy === 'hold').map(dy => plr.setDynamicProperty(dy, undefined)))
const reName = (item) => item.split(":")[1].split('_').map(v => v[0].toUpperCase() + v.slice(1).toLowerCase()).join(" ")

const INTERVAL_TICK = 20
const DISPLAY_ON_ACTIONBAR = true

const equipmentSlots = [
    EquipmentSlot.Head,
    EquipmentSlot.Chest,
    EquipmentSlot.Legs,
    EquipmentSlot.Feet,
    EquipmentSlot.Offhand,
    EquipmentSlot.Mainhand
]

system.runInterval(() => {
    world.getAllPlayers().forEach(player => {
        /** @type {EntityEquippableComponent} */
        const equippable = player.getComponent("equippable")
        if (!equippable) return resetProperties(player)

        equipmentSlots.forEach(slot => {
            const item = equippable.getEquipment(slot)
            if (!item) return resetProperties(player)

            const durability = item.getComponent("durability")
            if (!durability) return resetProperties(player)

            const remainingDurability = durability.maxDurability - durability.damage
            const hold = player.getDynamicProperty('hold') || ''
            const holdTime = Number(hold.split("§|")[1]) || 0
            const holdType = hold.split("§|")[0] || ''

            updateItemNameTag(item, remainingDurability, durability.maxDurability)
            updatePlayerProperties(player, item, holdType, holdTime, remainingDurability)

            item.setLore([`§r§7Durability: ${remainingDurability}/${durability.maxDurability}`])
            equippable.setEquipment(slot, item)
        })
    })
}, INTERVAL_TICK)

const resetProperties = (player) => {
    player.setDynamicProperty('hold', undefined)
}

const updateItemNameTag = (item, remainingDurability, maxDurability) => {
    const baseName = item.nameTag?.split('§|')[0] || `§r§f${reName(item.typeId)}`
    item.nameTag = `${baseName}§|§r §7(${remainingDurability}/${maxDurability})`
}

const updatePlayerProperties = (player, item, holdType, holdTime, remainingDurability, maxDurability) => {
    if (DISPLAY_ON_ACTIONBAR) {
        if (holdTime >= 4) {
            system.run(() => {
                player.setDynamicProperty('request.actionbar', `${item.nameTag?.split('§|')[0] || `§r§f${reName(item.typeId)}`} ${remainingDurability}/${maxDurability}`)
                player.setDynamicProperty('hold', `${item.typeId}§|`)
            })
        }
        player.setDynamicProperty('hold', `${item.typeId}§|${holdType === item.typeId ? holdTime + 1 : 1}`)
    }
}