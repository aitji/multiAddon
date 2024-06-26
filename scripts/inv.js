import { world, system, EquipmentSlot } from "@minecraft/server"
import { get } from "./main"
import { check } from "./_function"

const equipmentSlots = [EquipmentSlot.Head, EquipmentSlot.Chest, EquipmentSlot.Legs, EquipmentSlot.Feet, EquipmentSlot.Offhand]
let inventories = []
const ID = 'inv'
world.afterEvents.playerSpawn.subscribe(data => {
    if (!get(ID)) return
    const { player: pl, initialSpawn } = data
    if (!initialSpawn) return
    const allPlayer = world.getAllPlayers()
    system.run(async () => {
        pl.addTag('INV.TEMPORARY.TAG')

        const plr = allPlayer.find(f => f.name !== pl.name)
        if (plr) {
            const plrInv = plr.getComponent('inventory').container
            const plrEqu = plr.getComponent('minecraft:equippable')
            const plInv = pl.getComponent('inventory').container
            const plEqu = pl.getComponent('minecraft:equippable')

            for (let i = 0; i < 36; i++) {
                const item = plrInv.getItem(i)
                if (item) await plInv.setItem(i, item)
            }

            for (const slot of equipmentSlots) {
                const item = plrEqu.getEquipment(slot)
                await plEqu.setEquipment(slot, item)
            }

            inventories.push({
                name: pl.name,
                inv: newInv(plInv),
                equ: newInv(plEqu, true)
            })
        }

        pl.removeTag('INV.TEMPORARY.TAG')
    })
})

system.runInterval(() => system.run(() => {
    if (!get(ID)) return
    if (world.getAllPlayers().length > 1) update()
}))

function update() {
    const allPlayer = world.getAllPlayers().filter(plr => !plr.hasTag('INV.TEMPORARY.TAG'))
    for (const pl of allPlayer) {
        const inv = pl.getComponent('inventory').container
        const equ = pl.getComponent('minecraft:equippable')
        const invObj = inventories.find(f => f.name === pl.name)

        if (invObj) {
            const _inv = newInv(inv)
            const _equ = newInv(equ, true)

            if (!check(invObj.inv, _inv) || !check(invObj.equ, _equ)) {
                allPlayer.forEach(f => {
                    if (f.name !== pl.name) {
                        const { container } = f.getComponent('inventory')
                        for (let i = 0; i < 36; i++) {
                            const item = inv.getItem(i)
                            container.setItem(i, item)
                        }
                        const equip = f.getComponent('minecraft:equippable')
                        for (const slot of equipmentSlots) {
                            const item = equ.getEquipment(slot)
                            equip.setEquipment(slot, item)
                        }
                    }
                })
                invObj.inv = _inv
                invObj.equ = _equ
            }
        } else {
            const plr = allPlayer.find(f => f.name !== pl.name)
            const plrInv = plr ? plr.getComponent('inventory').container : undefined

            if (plrInv) {
                const plrEqu = plr.getComponent('minecraft:equippable')
                for (let i = 0; i < 36; i++) {
                    const item = plrInv.getItem(i)
                    if (item) inv.setItem(i, item)
                }
                for (const slot of equipmentSlots) equ.setEquipment(slot, plrEqu.getEquipment(slot))
                inventories.push({
                    name: pl.name,
                    inv: newInv(inv),
                    equ: newInv(equ, true)
                })
            }
        }
    }
}

function newInv(con, equ_ = false) {
    let items = []
    if (!equ_) {
        for (let i = 0; i < 36; i++) {
            const item = con.getItem(i)
            if (item) {
                const durability = item.getComponent("durability") ? item.getComponent("durability").damage : 0
                items.push({ typeId: item.typeId, amount: item.amount, durability, slot: i })
            }
        }
    } else {
        for (const slot of equipmentSlots) {
            const item_ = con.getEquipment(slot)
            const type_ = item_ ? item_.typeId : ''
            const durability_ = item_ ? (item_.getComponent("durability") ? item_.getComponent("durability").damage : 0) : 0
            items.push({ typeId: type_, durability: durability_, slot })
        }
    }
    return items
}