import { world, system, EquipmentSlot } from "@minecraft/server"
import { equipmentSlots, inventories } from "./_function"

world.afterEvents.playerSpawn.subscribe(data => {
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

function check(a, b) {
    if (a.length !== b.length) return false
    return a.every(item => b.some((otherItem) => JSON.stringify(item) === JSON.stringify(otherItem)))
}