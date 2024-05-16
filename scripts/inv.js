import { world, system, EquipmentSlot } from "@minecraft/server"

const equipmentSlots = [EquipmentSlot.Head, EquipmentSlot.Chest, EquipmentSlot.Legs, EquipmentSlot.Feet, EquipmentSlot.Offhand]
let inventories = []

const playerInv = () => system.run(() => {
    if (world.getAllPlayers().length > 1) {
        updatedInventory()
    }
    playerInv()
})
playerInv()

function updatedInventory() {
    for (const player of world.getAllPlayers()) {

        const inventory = player.getComponent('inventory').container
        const equipment = player.getComponent('minecraft:equippable')
        const invObject = inventories.find(f => { if (f.playerName === player.name) return f })
        if (invObject) {
            const thisInventory = newInventory(inventory)
            const thisEquipment = newInventory(equipment, true)
            if (!matchedObject(invObject.playerInventory, thisInventory) || !matchedObject(invObject.playerEquipment, thisEquipment)) {
                world.getAllPlayers().forEach(f => {
                    if (f.name != player.name) {
                        const container = f.getComponent('inventory').container
                        for (let i = 0; i < 36; i++) {
                            const itemStack = inventory.getItem(i)
                            container.setItem(i, itemStack)
                        }
                        const equip = f.getComponent('minecraft:equippable')
                        for (const slot of equipmentSlots) {
                            const itemStack = equipment.getEquipment(slot)
                            equip.setEquipment(slot, itemStack)
                        }
                    }
                })
                inventories.forEach(f => { f.playerInventory = thisInventory; f.playerEquipment = thisEquipment })
            }
        }
        else {
            const otherPlayer = world.getAllPlayers().find(f => { if (f.name != player.name) return f })
            const otherInventory = otherPlayer ? otherPlayer.getComponent('inventory') : undefined
            if (inventory) {
                const otherEquipment = otherPlayer.getComponent('minecraft:equippable')
                for (let i = 0; i < 36; i++) {
                    const itemStack = otherInventory.container.getItem(i)
                    if (itemStack) inventory.setItem(i, itemStack)
                }
                for (const slot of equipmentSlots) {
                    equipment.setEquipment(slot, otherEquipment.getEquipment(slot))
                }
                inventories.push({ playerName: player.name, playerInventory: newInventory(inventory), playerEquipment: newInventory(equipment, true) })
            }
        }
    }
}

function matchedObject(a, b) {
    if (a.length !== b.length) {
        return false
    }
    return a.every(item => b.some(
        (otherItem) => JSON.stringify(item) === JSON.stringify(otherItem)
    ))
}

function newInventory(container, equipment) {
    let items = []
    if (!equipment) {
        for (let i = 0; i < 36; i++) {
            const itemStack = container.getItem(i)
            if (itemStack) {
                const durability = itemStack.getComponent("durability") ? itemStack.getComponent("durability").damage : 0
                items.push({ typeId: itemStack.typeId, amount: itemStack.amount, durability: durability, slot: i })
            }
        }
    } else {
        for (const slot of equipmentSlots) {
            const slotItem = container.getEquipment(slot)
            const slotType = slotItem ? slotItem.typeId : ''
            const slotDurability = slotItem ? slotItem.getComponent("durability") ? slotItem.getComponent("durability").damage : 0 : 0
            items.push({ typeId: slotType, durability: slotDurability, slot: slot })
        }
    }
    return items
}