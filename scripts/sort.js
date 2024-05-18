import { Block, Container, ItemStack, system, world } from '@minecraft/server'

let blockRayCast = { includeLiquidBlocks: true, includePassableBlocks: false, maxDistance: 9 }
world.beforeEvents.itemUseOn.subscribe(data => {
    const { source, itemStack } = data
    handelItem(source, itemStack)
})

system.runInterval(() => {
    const obj = world.getAllPlayers()
    obj.forEach(pl => {
        const dynamicIds = pl.getDynamicPropertyIds().filter(id => id.startsWith('chest:'))
        if (dynamicIds) {
            dynamicIds.forEach(id => {
                let time = pl.getDynamicProperty(id) || 0
                if (time > 0) pl.setDynamicProperty(id, time - 1)
                else pl.setDynamicProperty(id, undefined)
            })
        }
    })
}, 20)

function handelItem(pl, item) {
    if (item?.typeId === "minecraft:stick" && pl.isSneaking) {
        let headLoc = pl.getHeadLocation()
        let headLocY = Math.abs(Math.floor(headLoc.y)) - Math.abs(headLoc.y)
        if (!(headLocY < 0.18)) return
        /** @type {Block} */
        let block = pl.getBlockFromViewDirection(blockRayCast).block
        system.run(() => {
            if ((!(isContainer(block.permutation)))) {
                pl.onScreenDisplay.setActionBar(`§7Can only be used on a chest!`)
                return
            }

            const dynamicId = pl.getDynamicPropertyIds().find(id => id === `chest:${block.location.x.toFixed(0)},${block.location.y.toFixed(0)},${block.location.z.toFixed(0)}`)
            if (dynamicId) {
                pl.onScreenDisplay.setActionBar(`       §7CHEST WAS SORTED\n§8now it on cooldown: ${pl.getDynamicProperty(dynamicId) || 0} second`)
            } else {
                pl.setDynamicProperty(`chest:${block.location.x.toFixed(0)},${block.location.y.toFixed(0)},${block.location.z.toFixed(0)}`, 10)
                sort(pl, block)
            }
        })
    }
}

function sort(pl, block) {
    if (!block) return

    let inv
    try { inv = block.getComponent("inventory").container }
    catch (e) {
        pl.onScreenDisplay.setActionBar(`§cFailed to get block inventory!`)
        return
    }

    let itemsObj = []
    for (let c = 0; c < inv.size; c++) {
        let item = inv.getItem(c)
        if (item) {
            itemsObj.push(item)
            inv.setItem(c, null)
        }
    }

    try {
        pl.onScreenDisplay.setActionBar(`§6Chest Sorted!`)
        const countArray = count(itemsObj)
        itemsObj.sort((a, b) => {
            const aValue = getCount(a.nameTag || a.typeId.split(":")[1], countArray) + extraLib(a, countArray)
            const bValue = getCount(b.nameTag || b.typeId.split(":")[1], countArray) + extraLib(b, countArray)
            if (aValue !== bValue) {
                return bValue - aValue
            } else {
                const aKey = a.nameTag || a.typeId.split(":")[1]
                const bKey = b.nameTag || b.typeId.split(":")[1]
                return aKey.localeCompare(bKey)
            }
        })

        for (let item of itemsObj) inv.addItem(item)
    } catch (e) {
        pl.sendMessage(`§7Error sorting! - ${e}`)
    }
}


/** 
 * @param {ItemStack} item 
 */
function extraLib(item, countArray) {
    const privilege = [
        `oak`, `ladder`, 'trapdoor', 'fence_gate', 'wooden', 'stick',
        `spruce`, `birch`, `jungle`,
        `acacia`, `dark_oak`, `mangrove`, `cherry`,
        `bamboo`, `crimson`, `warped`
    ]

    let typeId = item.typeId.split(":")[1]
    let find = privilege.findIndex(a => typeId.startsWith(a))
    if (find > -1) {
        if (typeId.includes('log')) find -= 1
        if (typeId.includes('_fence')) find += 1
        return privilege.length - find
    }
    return 0
}

function count(input) {
    const result = {}

    input.forEach((item) => {
        const typeId = item.nameTag || item.typeId.split(":")[1]
        result[typeId] = (result[typeId] || 0) + item.amount || 0
    })
    return result
}

function getCount(item, countArray) {
    return countArray[item] || 0
}

function isContainer(block_) {
    const container = [
        "minecraft:chest", "minecraft:barrel",
        "minecraft:dropper", "minecraft:dispenser",
        "minecraft:undyed_shulker_box", "minecraft:white_shulker_box",
        "minecraft:orange_shulker_box", "minecraft:black_shulker_box",
        "minecraft:cyan_shulker_box", "minecraft:gray_shulker_box",
        "minecraft:green_shulker_box", "minecraft:light_blue_shulker_box",
        "minecraft:light_gray_shulker_box", "minecraft:lime_shulker_box",
        "minecraft:pink_shulker_box", "minecraft:purple_shulker_box",
        "minecraft:red_shulker_box"
    ]

    return container.some(block => block_.matches(block)) || false
}