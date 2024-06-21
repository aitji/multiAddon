import { Container, ItemStack, Player, system, world } from "@minecraft/server"
import { ModalFormData } from "@minecraft/server-ui"
import { DEBUG, TPS_DISPLAY, wait } from "./_function.js"
if (DEBUG) world.sendMessage(`§c* WARNING, you're enable debug mode please disable before publish!`)
if (TPS_DISPLAY) world.sendMessage(`§c* WARNING, you're enable TPS DISPLAY mode please disable before publish!`)

const setting = new ItemStack('multi:addon', 1)
setting.keepOnDeath = true
const data = ['campfire', 'durability', 'float', 'harvest', 'hp', 'inv', 'light', 'sort', 'snOffhand', 'stackMob']

async function importer() {
    /** @type {String} */
    const cache = world.getDynamicProperty('setting') || '0000000000'
    const cacheSp = cache.split('')

    for (let i = 0; i < cacheSp.length; i++) {
        const name = data[i]
        // if (cacheSp[i] === '1') {
        // if (DEBUG) world.sendMessage(`§7${name} has been imported!`)
        await import(`./${name}.js`)
        // }
    }
}

importer()
import "./actionbar.js"

world.afterEvents.playerSpawn.subscribe(data => {
    const { initialSpawn, player } = data
    if (!initialSpawn) return
    const dy = player.getDynamicProperty('join') || false
    if (dy) return
    else {
        player.setDynamicProperty('join', true)
        wait(80).then(() => {
            /** @type {Container} */
            const inv = player.getComponent('inventory').container
            inv.addItem(setting)
            player.addTag('trusted')
        })
    }
})

world.beforeEvents.itemUse.subscribe(data => {
    const { source, itemStack } = data

    if (itemStack.typeId === 'multi:addon') {
        if (source.hasTag('trusted')) menu(source)
        else source.sendMessage(`§cThis requirement tag 'trusted' to use!`)
    }
})

const isBool = (int) => { return parseInt(int) == 1 }
const toNum = (bool) => { return bool ? 1 : 0 }

/** @type {Player} */
function menu(player) {
    system.run(() => {
        const cache = world.getDynamicProperty('setting') || '0000000000'
        const [camp, durability, float, harvest, hp, inv, light, sort, snOffhand, stackMob] = cache.split('') // 0000000000
        const form = new ModalFormData()
        form.title(`Host: Addon List`)
        form.toggle(`Lit Campfire`, isBool(camp))
        form.toggle(`Tool Durability`, isBool(durability))
        form.toggle(`Floating ItemName`, isBool(float))
        form.toggle(`Hoe to Harvest`, isBool(harvest))
        form.toggle(`Sync Health`, isBool(hp))
        form.toggle(`Sync Inv`, isBool(inv))
        form.toggle(`Dynamic Light`, isBool(light))
        form.toggle(`Stick Sort`, isBool(sort))
        form.toggle(`sneak to offhand`, isBool(snOffhand))
        form.toggle(`stackMob`, isBool(stackMob))
        form.show(player).then((res) => {
            if (res.canceled) return
            const resu = res.formValues
            const list = resu.slice(0, 10).map(toNum).join('')
            if (list === cache) return
            else {
                world.setDynamicProperty('setting', list)
                // world.sendMessage(`§c* request to §l/reload`)
            }
        })
    })
}

/**
 * @param {String} id 'campfire', 'durability', 'float', 'harvest', 'hp', 'inv', 'light', 'sort', 'snOffhand'
 * @returns {Boolean}
 */
export const get = (id) => {
    const index = data.indexOf(id)
    if (index > -1) {
        const cache = world.getDynamicProperty('setting') || '0000000000'
        return cache[index] === '1'
    }
    return false
}