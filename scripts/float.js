import { world, system, ItemStack, Player, EntityComponentTypes } from "@minecraft/server"
import { calDis, isMatches, rayCastPos, reName, wait } from "./_function"
import { get } from "./main"

const ID = 'float'

system.runInterval(() => {
    if (!get(ID)) return

    const DY = world.getDynamicProperty(ID) || `§f{name} §cx{count}§:1§:8`
    const [name, toggle, max_] = DY.split('§:')

    const items = world.getDimension('overworld').getEntities({ type: 'minecraft:item' })
    for (const ie of items) {
        if (ie.isFalling) continue

        /** @type {ItemStack} */
        const item = ie.getComponent('item').itemStack
        const entities = ie.dimension.getEntities({ location: ie.location, type: 'minecraft:item', maxDistance: parseFloat(max_) })

        if (toggle === '0') ie.nameTag = tran(item, item.amount, name)
        else {
            let ta = 0
            let enMax = null
            let max = -1

            for (const en of entities) {
                if (en.isFalling) continue
                /** @type {ItemStack} */
                const it = en.getComponent('item').itemStack
                if (it.amount > max) {
                    max = it.amount
                    enMax = en
                }
                if (item.typeId === it.typeId) ta += it.amount
            }

            for (const en of entities) {
                const enMaxItem = enMax.getComponent('item').itemStack
                if (en === enMax) en.nameTag = tran(item, ta || item.amount, name)
                else {
                    if (enMaxItem.typeId === item.typeId) {
                        if (en.isFalling) continue
                        en.teleport(ie.location)
                        en.nameTag = '§r'
                    }
                }
            }
        }
    }
}, 5)

const tran = (item, ta, set) => {
    let data_set = rep(set, `name`, item?.nameTag || reName(item?.typeId))
    return rep(data_set, `count`, ta)
}

world.afterEvents.entityDie.subscribe(data => {
    if (!get(ID)) return
    const { deadEntity: player } = data
    const entity = player.dimension.getEntities({ maxDistance: 32, location: player.location, type: 'minecraft:item' })
    entity.forEach(en => en.nameTag = `§r`)
}, { entityTypes: ["minecraft:player"] })

world.afterEvents.entitySpawn.subscribe(({ entity }) => {
    if (!get(ID)) return
    try {
        if (entity?.typeId !== "minecraft:item" && entity?.isValid()) return
        const DY = world.getDynamicProperty(ID) || `§f{name} §cx{count}§:1§:8`
        const [name, _, _2] = DY?.split('§:')

        const item = entity.getComponent("item").itemStack
        entity.nameTag = tran(item, item?.amount, name)
    } catch { }
})

const rep = (str, key, value) => {
    const regex = new RegExp(`{${key}}`, 'g')
    return str.replace(regex, value)
}