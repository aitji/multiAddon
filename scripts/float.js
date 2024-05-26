import { world, system, MinecraftDimensionTypes, Entity, ItemStack } from "@minecraft/server"
const reName = (item) => item.split(":")[1].split('_').map(v => v[0].toUpperCase() + v.slice(1).toLowerCase()).join(" ")
system.runInterval(() => system.run(() => {
    /** @type {Array} */
    const entity = []
    world.getDimension(MinecraftDimensionTypes.overworld).getEntities({ type: "minecraft:item" }).forEach(en => entity.push(en))
    world.getDimension(MinecraftDimensionTypes.nether).getEntities({ type: "minecraft:item" }).forEach(en => entity.push(en))
    world.getDimension(MinecraftDimensionTypes.theEnd).getEntities({ type: "minecraft:item" }).forEach(en => entity.push(en))
    entity.forEach(en => {
        /** @type {Entity} */
        const entity = en

        const item = entity.getComponent("item").itemStack
        const name = item.nameTag || reName(item.typeId) || item.typeId
        const inRender_blur = entity.runCommand(`testfor @a[r=18]`).successCount
        const inRender_hidden = entity.runCommand(`testfor @a[r=28]`).successCount
        if (inRender_blur === 1) entity.nameTag = `§r§f${name} §r§cx${item.amount}§r`
        else if (inRender_hidden === 1) entity.nameTag = `§r§f§k${name}§r §r§cx§k${item.amount}§r`
        else entity.nameTag = `§r`
    })
}), 10)

world.afterEvents.entitySpawn.subscribe(({ entity }) => {
    try {
        if (entity.typeId === "minecraft:item") {
            const item = entity.getComponent("item").itemStack
            const name = item.nameTag || reName(item.typeId) || item.typeId
            const inRender_blur = entity.runCommand(`testfor @a[r=18]`).successCount
            const inRender_hidden = entity.runCommand(`testfor @a[r=28]`).successCount
            if (inRender_blur === 1) entity.nameTag = `§r§f${name} §r§cx${item.amount}§r`
            else if (inRender_hidden === 1) entity.nameTag = `§r§f§k${name}§r §r§cx§k${item.amount}§r`
            else entity.nameTag = `§r`
        }
    } catch (e) { }
})