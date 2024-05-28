import { world, system, MinecraftDimensionTypes, Entity, ItemStack, Player } from "@minecraft/server"
import { reName } from "./_function"

function subV(v1, v2) { return { x: v1.x - v2.x, y: v1.y - v2.y, z: v1.z - v2.z, } }
function norV(v) {
    const length = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z)
    if (length === 0) return { x: 0, y: 0, z: 0 }
    return { x: v.x / length, y: v.y / length, z: v.z / length, }
}
/**@param {Player} pl @returns {Array.<Entity>}*/
function getEnChuck(pl) {
    const viewEn = []
    const vd = norV(pl.getViewDirection())
    const en = pl.dimension.getEntities({type: "minecraft:item"})
    const loc = pl.location
    const vdX = vd.x, vdY = vd.y, vdZ = vd.z // Cache values //

    for (const entity of en) {
        const toEnt = subV(entity.location, loc)
        const norm = norV(toEnt)
        const dot = vdX * norm.x + vdY * norm.y + vdZ * norm.z
        if (dot > 0.4) viewEn.push(entity)
    }

    return viewEn
}

system.runInterval(() => system.run(() => {
    world.getAllPlayers().forEach(plr => {
        const entity = getEnChuck(plr)
        entity.forEach(en => {
            /** @type {ItemStack} */
            const item = en.getComponent("item").itemStack
            const dis = item.nameTag || reName(item.typeId) || item.typeId
            const blur = en.runCommand(`testfor @a[r=18]`).successCount === 1
            const hid = en.runCommand(`testfor @a[r=28]`).successCount === 1
            if (blur) en.nameTag = `§r§f${dis} §r§cx${item.amount}§r`
            else if (hid) en.nameTag = `§r§f§k${dis}§r §r§cx§k${item.amount}§r`
            else en.nameTag = `§r`
        })
    })
}), 3)

world.afterEvents.entitySpawn.subscribe(({ entity }) => {
    try {
        if (entity.typeId === "minecraft:item") {
            const item = entity.getComponent("item").itemStack
            const dis = item.nameTag || reName(item.typeId) || item.typeId
            const blur = entity.runCommand(`testfor @a[r=18]`).successCount === 1
            const hid = entity.runCommand(`testfor @a[r=28]`).successCount === 1
            if (blur) entity.nameTag = `§r§f${dis} §r§cx${item.amount}§r`
            else if (hid) entity.nameTag = `§r§f§k${dis}§r §r§cx§k${item.amount}§r`
            else entity.nameTag = `§r`
        }
    } catch (e) { }
})