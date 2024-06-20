import { world, system, ItemStack, Player } from "@minecraft/server"
import { calDis, isMatches, reName } from "./_function"
import { get } from "./main"
const ID = 'float'

system.runInterval(() => {
    const IDCheck = get(ID)
    if (!IDCheck) return

    const players = world.getAllPlayers()
    const count = new Map()

    players.forEach(player => {
        const health = player.getComponent("health").currentValue || 0
        if (Math.ceil(health) < 0) return

        const items = player.dimension.getEntities({
            maxDistance: 64,
            location: player.location,
            type: 'minecraft:item'
        })

        items.forEach(ie => {
            const ic = ie.getComponent("item")
            if (!ic) return

            const itemStack = ic.itemStack
            const nearbyItems = ie.dimension.getEntities({
                type: 'minecraft:item',
                maxDistance: 5,
                location: ie.location,
                minDistance: 1,
                closest: 1
            })

            const targetItem = nearbyItems[0]
            if (targetItem) {
                const targetItemStack = targetItem.getComponent("item").itemStack
                if (isMatches(itemStack, targetItemStack, false)) {
                    if (itemStack.amount > targetItemStack.amount) {
                        targetItem.teleport(ie.location)
                        targetItem.nameTag = '§r'
                        return
                    } else {
                        ie.teleport(targetItem.location)
                        return
                    }
                }
            }

            const typeId = itemStack.typeId
            if (!count.has(typeId)) count.set(typeId, 0)

            count.set(typeId, count.get(typeId) + itemStack.amount)

            const displayName = itemStack.nameTag || reName(typeId) || typeId
            const distance = calDis(ie, player) || 0

            const overlap = ie.dimension.getEntities({
                type: 'minecraft:item',
                maxDistance: 1,
                location: ie.location,
                minDistance: 0
            })

            if (overlap.length > 1) overlap.forEach(ol => {
                if (isMatches(ol, itemStack)) ol.nameTag = `§r`
            })

            const ta = count.get(typeId)
            if (distance <= 18) ie.nameTag = `§r§f${displayName} §r§cx${ta}§r`
            else if (distance <= 28) ie.nameTag = `§r§f§k${displayName}§r §r§cx§k${ta}§r`
            else ie.nameTag = `§r`
        })
    })
}, 3)

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
        const blur = entity.runCommand(`testfor @a[r=18]`).successCount === 1
        const hid = entity.runCommand(`testfor @a[r=28]`).successCount === 1
        if (blur) entity.nameTag = `§r§f${dis} §r§cx?§r`
        else if (hid) entity.nameTag = `§r§f§k${dis} §r§k§cx?§r`
        else entity.nameTag = `§r`
    } catch { }
})