import {
    world, system, EquipmentSlot,
    ItemDurabilityComponent, ItemStack, EntityEquippableComponent
} from "@minecraft/server"

world.getAllPlayers().map(plr => plr.getDynamicPropertyIds().filter(dy => dy === 'hold' || dy === 'dmg').map(dy => plr.setDynamicProperty(dy, undefined)))
const INTERVAL_TICK = 20
const DISPLAY_ON_ACTIONBAR = true

const reName = (item) => item.split(":")[1].split('_').map(v => v[0].toUpperCase() + v.slice(1).toLowerCase()).join(" ")

system.runInterval(() => {
    world.getAllPlayers().forEach(player => {
        const equippable = player.getComponent("equippable")
        if (!equippable) return resetProperties(player)

        const item = equippable.getEquipment(EquipmentSlot.Mainhand)
        if (!item) return resetProperties(player)

        const durability = item.getComponent("durability")
        if (!durability) return resetProperties(player)

        const remainingDurability = durability.maxDurability - durability.damage
        const hold = player.getDynamicProperty('hold') || ''
        const holdTime = Number(hold.split("§|")[1]) || 0
        const holdType = hold.split("§|")[0] || ''

        let diff = remainingDurability - (player.getDynamicProperty('dmg') || 0)
        if (diff === durability.maxDurability) diff = 0

        updateItemNameTag(item, remainingDurability, durability.maxDurability, diff)
        updatePlayerProperties(player, item, holdType, holdTime, remainingDurability)

        item.setLore([`§r§7Durability: ${remainingDurability}/${durability.maxDurability}`])
        equippable.setEquipment(EquipmentSlot.Mainhand, item)
    })
}, INTERVAL_TICK)

const resetProperties = (player) => {
    player.setDynamicProperty('hold', undefined)
    if (DISPLAY_ON_ACTIONBAR) player.setDynamicProperty('dmg', undefined)
}

const updateItemNameTag = (item, remainingDurability, maxDurability, diff) => {
    const baseName = item.nameTag?.split('§|')[0] || `§r§f${reName(item.typeId)}`
    item.nameTag = `${baseName}§|§r §7(${remainingDurability}/${maxDurability})§r${diff ? ` §7(${diff > 0 ? `§a+${diff}` : `§c${diff}`})§7` : ''}`
}

const updatePlayerProperties = (player, item, holdType, holdTime, remainingDurability) => {
    if (DISPLAY_ON_ACTIONBAR) {
        if (holdTime >= 4) {
            system.run(() => {
                player.onScreenDisplay.setActionBar(`${item.nameTag}`)
                player.setDynamicProperty('hold', `${item.typeId}§|9`)
            })
        }
        player.setDynamicProperty('hold', `${item.typeId}§|${holdType === item.typeId ? holdTime + 1 : 1}`)
    }

    player.setDynamicProperty('dmg', remainingDurability)
}