import { Container, ItemStack, Player, system, world } from "@minecraft/server"
import { ModalFormData } from "@minecraft/server-ui"
import { DEBUG, TPS_DISPLAY, wait } from "./_function.js"
const setting = new ItemStack('multi:addon', 1)
setting.keepOnDeath = true
if (DEBUG) world.sendMessage(`§c* WARNING, you're enable debug mode please disable before publish!`)
if (TPS_DISPLAY) world.sendMessage(`§c* WARNING, you're enable TPS DISPLAY mode please disable before publish!`)

/** @param {String} id 'campfire', 'durability', 'float', 'harvest', 'hp', 'inv', 'light', 'sort', 'snOffhand' @returns {Boolean} */
export const get = id => (world.getDynamicProperty('setting') || '0000000000')[data.indexOf(id)] === '1'
const data_ = {
    'campfire': 'Lit Campfire',
    'durability': 'Tool Durability',
    'float': 'Floating ItemName',
    'harvest': 'Hoe to Harvest',
    'hp': 'Sync Health',
    'inv': 'Sync Inv',
    'light': 'Dynamic Light',
    'sort': 'Stick Sort',
    'snOffhand': 'sneak to offhand',
    'stackMob': 'stackMob'
}
const data = Object.keys(data_)
async function importer() { for (const name of data.slice(0, (world.getDynamicProperty('setting') || '0000000000').length)) await import(`./${name}.js`) }
import "./actionbar.js"
importer() // import other file

world.beforeEvents.itemUse.subscribe(({ source, itemStack }) => itemStack.typeId === 'multi:addon' && system.run(() => source.hasTag('trusted') ? menu(source) : source.sendMessage("§cThis requires the 'trusted' tag to use!")))
const spawnTick = world.afterEvents.playerSpawn.subscribe(({ initialSpawn, player }) => {
    if (player.id === '-4294967295' || !initialSpawn || player?.getDynamicProperty('join')) return -1
    wait(80).then(() => {
        player.getComponent('inventory').container.addItem(setting)
        player.addTag('trusted')
        player.setDynamicProperty('join', true)
        world.afterEvents.playerSpawn.unsubscribe(spawnTick)
    })
})


const isBool = (int) => { return parseInt(int) == 1 }
const toNum = (bool) => { return bool ? 1 : 0 }

/** @type {Player} */
function menu(player) {
    system.run(() => {
        const cache = world.getDynamicProperty('setting') || '0000000000'
        const form = new ModalFormData().title(`Host: Addon List`)
        Object.values(data_).forEach((label, i) => form.toggle(label, isBool(cache[i])))
        form.show(player).then((res) => {
            if (res.canceled) return
            const list = res.formValues.map(toNum).join('')
            if (list === cache) return

            world.setDynamicProperty('setting', list)
            world.getDimension('overworld').getEntities({ type: 'minecraft:item' }).forEach(it => it.nameTag = '§r')
        })
    })
}