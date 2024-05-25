import { world, system, MinecraftDimensionTypes, Entity, ItemStack } from "@minecraft/server"
const reName = (item) => item.split(":")[1].split('_').map(v => v[0].toUpperCase() + v.slice(1).toLowerCase()).join(" ")
system.runInterval(() => system.run(() => {
    /** @type {Array} */
    const entity = []
    world.getDimension(MinecraftDimensionTypes.overworld).getEntities({ type: "minecraft:item" }).forEach(en => entity.push(en))
    world.getDimension(MinecraftDimensionTypes.nether).getEntities({ type: "minecraft:item" }).forEach(en => entity.push(en))
    world.getDimension(MinecraftDimensionTypes.theEnd).getEntities({ type: "minecraft:item" }).forEach(en => entity.push(en))
    entity.forEach(plr => {
        /** @type {Entity} */
        const entity = plr
        const isPlayerFound = (entity.runCommand(`testfor @a[r=18]`).successCount === 1)
        if (isPlayerFound) {
            /** @type {ItemStack} */
            const item = entity.getComponent("item").itemStack
            if(!item) return
            item.nameTag = `§r§o§f${item.nameTag || reName(item.typeId)} §r§cx${item.amount}`
        }
    })
}))