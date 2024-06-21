const it = [
    'minecraft:player', 'minecraft:item',
    'minecraft:xp_orb', 'minecraft:xp_bottle',
    'minecraft:item', 'minecraft:arrow',
    'minecraft:minecart', 'minecraft:chest_minecart',
    'minecraft:command_block_minecart', 'minecraft:hopper_minecart',
    'minecraft:boat', 'minecraft:chest_boat',
    'minecraft:splash_potion', 'minecraft:tnt'
]

import { world, Player, system, ItemUseOnBeforeEvent, ItemUseBeforeEvent, EntityComponentTypes, Container, EntityEquippableComponent, EquipmentSlot, ItemStack } from "@minecraft/server"
import { DEBUG, reName } from "./_function"
import { get } from "./main"
const ID = 'stackMob'

function csm(e, l) {
    if (e instanceof Player) return null
    return e.dimension.getEntities({
        type: e.typeId,
        location: l,
        maxDistance: 5,
        minDistance: 0.5
    })
}

function stack(e, around) {
    const entityNameTag = e?.nameTag || `${reName(e.typeId)} §6x1`
    let eNumber = enfN(entityNameTag)
    let sum = eNumber
    let found = null

    for (const ne of around) {
        const nearNum = enfN(ne.nameTag)
        if (nearNum !== null) {
            sum += nearNum
            found = ne
        }
    }

    if (found !== null) {
        e.nameTag = format(e, sum)
        found.remove()
    } else {
        for (const nearE of around) {
            if (nearE !== e) {
                nearE.remove()
                eNumber++
            }
        }
        e.nameTag = format(e, eNumber)
    }
}

const format = (e, n) => { return `§f${reName(e.typeId)} §6x${n}§r` }
const enfN = (n) => {
    const m = n.match(/x(\d+)/)
    return m ? parseInt(m[1]) : 1
}

system.runInterval(() => {
    if (!get(ID)) return
    const all = world.getAllPlayers()
    for (const pl of all) {
        /** @type {EntityEquippableComponent} */
        const equ = pl.getComponent(EntityComponentTypes.Equippable)
        const item = equ?.getEquipment(EquipmentSlot?.Mainhand)
        if (item) {
            if (item.typeId === 'minecraft:name_tag' && item?.nameTag) {
                pl.setDynamicProperty(`actionbar§:§l§7STACK MOB:§r§7 Returning Level to you!`, 3)
                pl.addLevels(1)
                equ?.setEquipment(EquipmentSlot?.Mainhand, new ItemStack(item.typeId, item.amount))
            }
        }
        pl.dimension.getEntities({ location: pl.location, maxDistance: 16, excludeTypes: it }).forEach(e => {
            if (!e.isValid()) return
            const ce = csm(e, e.location)
            if (ce.length > 0) stack(e, ce)
        })
    }
}, 10)

world.afterEvents.entityDie.subscribe((event) => {
    if (!get(ID)) return
    const entity = event.deadEntity
    if (!entity?.isValid() || event?.damageSource?.cause == 'suicide') return
    let n = enfN(entity.nameTag)
    if (n > 1) {
        const en = entity.dimension.spawnEntity(entity.typeId, entity.location)
        en.nameTag = format(en, n - 1)
    }
})

/**
 * 
 * @param {ItemUseBeforeEvent} event 
 */
const handleItemUse = (event) => {
    if (!get(ID)) return
    const { itemStack, source: player } = event
    if (itemStack.typeId === 'minecraft:name_tag' && itemStack?.nameTag) {
        event.cancel = true
        player.setDynamicProperty(`actionbar§:§l§7STACK MOB:§r§7 block it so can't use it`, 3)
    }
}

world.beforeEvents.itemUse.subscribe(handleItemUse)
world.beforeEvents.itemUseOn.subscribe(handleItemUse)

world.afterEvents.entityHitEntity.subscribe(data => {
    if (!DEBUG && !get(ID)) return
    const { damagingEntity: pl, hitEntity: hit } = data
    /** @type {ItemStack} */
    const item = pl.getComponent(EntityComponentTypes.Equippable)?.getEquipment(EquipmentSlot?.Mainhand)
    if (item) {
        if (item.typeId === 'minecraft:barrier') hit.remove()
    }
})