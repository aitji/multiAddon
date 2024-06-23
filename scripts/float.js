import { world, system, ItemStack, Player, EntityComponentTypes } from "@minecraft/server"
import { calDis, isMatches, reName, wait } from "./_function"
import { get } from "./main"
const ID = 'float'

system.runInterval(() => {
    if (!get(ID)) return
    const items = world.getDimension('overworld').getEntities({ type: 'minecraft:item' })
    for (const ie of items) {
        if (ie.isFalling) continue
        /** @type {ItemStack} */
        const item = ie.getComponent('item').itemStack
        const entities = ie.dimension.getEntities({ location: ie.location, type: 'minecraft:item', maxDistance: 8 })
        let ta = 0

        let enMax = null
        let max = -1

        for (const en of entities) {
            if (en.isFalling) continue
            /** @type {ItemStack} */
            const it = en.getComponent('item').itemStack;
            if (it?.amount > max) {
                max = it.amount
                enMax = en
            }

            if (item?.typeId === it?.typeId) ta += it?.amount
        }

        for (const en of entities) {
            if (en === enMax) en.nameTag = `§r§f${item?.nameTag || reName(item.typeId)} §r§cx${ta || item.amount}§r`
            else {
                en.teleport(ie.location)
                en.nameTag = '§r'
            }
        }
    }
}, 5)

world.afterEvents.entityDie.subscribe(data => {
    if (!get(ID)) return
    const { deadEntity: player } = data
    const entity = player.dimension.getEntities({ maxDistance: 32, location: player.location, type: 'minecraft:item' })
    entity.forEach(en => en.nameTag = `§r`)
}, { entityTypes: ["minecraft:player"] })

world.afterEvents.entitySpawn.subscribe(({ entity }) => {
    if (!get(ID)) return
    try {
        if (entity.typeId !== "minecraft:item") return
        const item = entity.getComponent("item").itemStack
        const dis = item.nameTag || reName(item.typeId) || item.typeId
        entity.nameTag = `§r§f${dis} §r§cx${item?.amount}§r`
    } catch { }
})