import { world, system, ItemStack, Player } from "@minecraft/server"
import { calDis, reName } from "./_function"

system.runInterval(() => system.run(() => {
    world.getAllPlayers()
        .filter(plr => Math.ceil(plr.getComponent("health").currentValue || 0) > 0)
        .forEach(plr => {
            const entity = plr.dimension.getEntities({ maxDistance: 32, location: plr.location, type: 'minecraft:item' })
            entity.forEach(en => {
                /** @type {ItemStack} */
                const item = en.getComponent("item").itemStack
                const dis = item.nameTag || reName(item.typeId) || item.typeId
                const distance = calDis(en, plr) || 0
                if (distance <= 18) en.nameTag = `§r§f${dis} §r§cx${item.amount}§r`
                else if (distance <= 28) en.nameTag = `§r§f§k${dis}§r §r§cx§k${item.amount}§r`
                else en.nameTag = `§r`
            })
        })
}), 3)

world.afterEvents.entityDie.subscribe(data => {
    const { deadEntity: player } = data
    const entity = player.dimension.getEntities({ maxDistance: 32, location: player.location, type: 'minecraft:item' })
    entity.forEach(en => en.nameTag = `§r`)
}, { entityTypes: ["minecraft:player"] })

world.afterEvents.entitySpawn.subscribe(({ entity }) => {
    try {
        if (entity.typeId !== "minecraft:item") return
        const item = entity.getComponent("item").itemStack
        const dis = item.nameTag || reName(item.typeId) || item.typeId
        const blur = entity.runCommand(`testfor @a[r=18]`).successCount === 1
        const hid = entity.runCommand(`testfor @a[r=28]`).successCount === 1
        if (blur) entity.nameTag = `§r§f${dis} §r§cx${item.amount}§r`
        else if (hid) entity.nameTag = `§r§f§k${dis}§r §r§cx§k${item.amount}§r`
        else entity.nameTag = `§r`
    } catch { }
})