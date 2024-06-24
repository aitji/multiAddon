import { Container, ItemStack, Player, system, world } from "@minecraft/server"
import { ActionFormData, MessageFormData, ModalFormData } from "@minecraft/server-ui"
import { clean, DEBUG, isNum, TPS_DISPLAY, wait } from "./_function.js"
const setting = new ItemStack('multi:addon', 1)
const getSetting = () => { return world.getDynamicProperty('setting') || '0000000000' }
setting.keepOnDeath = true
if (DEBUG) world.sendMessage(`§c* WARNING, you're enable debug mode please disable before publish!`)
if (TPS_DISPLAY) world.sendMessage(`§c* WARNING, you're enable TPS DISPLAY mode please disable before publish!`)

/** @param {String} id 'campfire', 'durability', 'float', 'harvest', 'hp', 'inv', 'light', 'sort', 'snOffhand' @returns {Boolean} */
export const get = id => getSetting()[data.indexOf(id)] === '1'
const dataSet = {
    /** ID
     * Addon:
     *  Label
    */
    'campfire': //0
        'Lit Campfire',
    'durability':
        'Tool Durability',
    'float':
        'Floating ItemName',
    'harvest':
        'Hoe to Harvest',
    'hp':
        'Sync Health',
    'inv':
        'Sync Inv',
    'light':
        'Dynamic Light',
    'sort':
        'Stick Sort',
    'snOffhand':
        'sneak to offhand',
    'stackMob': // 9
        'stackMob'
}
const data = Object.keys(dataSet)
const dataV = Object.values(dataSet)
const isBool = (int) => parseInt(int) == 1
const toNum = (bool) => bool ? 1 : 0
async function importer() { for (const name of data.slice(0, getSetting().length)) await import(`./${name}.js`) }
import "./actionbar.js"
importer() // import other file

world.beforeEvents.itemUse.subscribe(({ source, itemStack }) => itemStack.typeId === 'multi:addon' && system.run(() => source.hasTag('trusted') ? overview(source) : source.sendMessage("§cThis requires the 'trusted' tag to use!")))
const spawnTick = world.afterEvents.playerSpawn.subscribe(({ initialSpawn, player }) => {
    if (player.id === '-4294967295' || !initialSpawn || player?.getDynamicProperty('join')) return -1
    wait(80).then(() => {
        player.getComponent('inventory').container.addItem(setting)
        player.addTag('trusted')
        player.setDynamicProperty('join', true)
        world.afterEvents.playerSpawn.unsubscribe(spawnTick)
    })
})

/** @param {Player} player */
const end = (player) => {
    const cache = getSetting()
    const form = new ModalFormData().title(`Host: §lAddon List`)
    dataV.forEach((label, i) => form.toggle(label, isBool(cache[i])))
    form.show(player).then(({ canceled, formValues }) => {
        if (canceled) return
        const list = formValues.map(toNum).join('')
        if (list === cache) return
        const des = []
        data.forEach((name, i) => {
            if (list[i] === '1') des.push(`§l§a| §r§f${name} §aEnable`)
            else des.push(`§l§c| §r§f${name} §cDisabled`)
        })
        world.setDynamicProperty('setting', list)
        world.getDimension('overworld').getEntities({ type: 'minecraft:item' }).forEach(it => it.nameTag = '§r')
        player.sendMessage(`§l§a» §r§fYou data was §asaved!\n§r${des.join("\n")}`)
        player.playSound(`random.orb`)
    })
}

/** @param {Player} player  */
const overview = (player) => {
    const cache = getSetting()
    const des = []
    data.forEach((name, i) => {
        if (cache[i] === '1') des.push(`§l§a| §r§f${name} §aEnable`)
        else des.push(`§l§c| §r§f${name} §cDisabled`)
    })
    const form = new ActionFormData().title(`Host: §lAddon Overview`)
    form.body(`
Hey There §c@${player.name.toLowerCase().split(' ')[0]}§r,
These pages offer an extensive §lAddon Setting§r for you.
You can modify every aspect to personalize the addon and enhance your gaming experience!

§l§6» §r§fAddon §lStatus§r
${des.join("\n")}
`)
    form.button(`Enable/Disable §l(Addon)§r`, `textures/ui/sidebar_icons/addon`)
    form.button(`Reset §lALL§r\nAddon Setting`, `textures/ui/sidebar_icons/redheart`)
    form.button(`§lCAMPFIRE§r\n(Addon's Setting)`, `textures/items/campfire`)
    form.button(`§lDURABILITY§r\n(Addon's Setting)`, `textures/ui/sidebar_icons/csb_sidebar_icon`)

    // dataV.forEach((label, i) => form.button(`§l${label}§r\n(Addon's Setting)`))
    form.show(player).then((res) => {
        if (res.canceled) return
        switch (res?.selection) {
            case 0:
                end(player)
                break
            case 1:
                resetChange(player)
                break
            default:
                settingHandel(player, res.selection - 2)
                break
        }
    })
}

/** @param {Player} player */
const resetChange = (player) => {
    const form = new MessageFormData().title(`Host: §lReSet§r`)
    form.body(`
Hey §c@${player.name.toLowerCase().split(' ')[0]}§r,
This will reset everything to default
like you download addon first time!`)
    form.button1(`§4Cancel`)
    form.button2(`Confirm!`)
    form.show(player).then((res) => {
        if (res.selection === 1) {
            player.sendMessage(`§l§a» §r§fevery setting has been §areset`)
            player.playSound('random.orb')
            world.setDynamicProperty('setting', undefined)
            dataV.map(d => world.setDynamicProperty(d, undefined))
        }
    })
}

/** @param {Player} player */
const settingHandel = (player, index) => {
    const ID = data[parseInt(index)]
    const ADDON = String(world.getDynamicProperty(ID) || '')
    const parts = ADDON?.split("§:")
    const form = new ModalFormData().title(`Host: §l${ID}'s Setting§r`)

    switch (parseInt(index)) {
        case 0:
            form.textField(`§6§l» §rThis is all §6campfire§r setting\n\n§l1. §rEXPIRE_SECOND: (:300) §c*\n§r§7This limit at 1,000,000`, `Enter the expire time of campfire`, parts[0] || "300")
            form.toggle(`§l2. §rPlace campfire will instantly unlit: (:false)`, parts[1] === '1')
            form.show(player).then(({ formValues, canceled }) => {
                if (canceled) return
                const num = isNum(formValues[0], 1000000, true)
                if (num !== false) done(player, ID, `${num}§:${toNum(formValues[1])}`)
                else errorSend(player)
            }).catch((e) => errorSend(player, e))
            break
        case 1:
            form.textField(`§e§l» §rThis is setting for §eDURABILITY\n\n§r§l1. §rActionBar Format §c*§r\nEXAMPLE: §f{name} §7({remain}/{max})§r\n\n{name} - item name\n{remain} - remain durability\n{max} - max durability\n§r`, `Type your own format here`, parts[0] || '§f{name} §7({remain}/{max})')
            const labels = ['Head', 'Chest', 'Legs', 'Off', 'Main']
            labels.map((label, index) => form.toggle(`§l${index + 2}. §rEquipmentSlot §l(${label}) §r§c*`, isBool(parts[index + 1])))

            form.show(player).then(({ formValues, canceled }) => {
                if (canceled) return

                const [durability, ...equipment] = formValues
                const data = `${durability}§:${equipment.map(toNum).join('§:')}`
                done(player, ID, data)
            }).catch((e) => errorSend(player, e))
            break
        default:
            player.sendMessage(`§c§l» §r§fUnhandled SettingHandel §cIndex ID: ${index}:${ID}`)
            player.playSound('random.break')
            break
    }
}

const done = (player, ID = '', val = undefined) => {
    world.setDynamicProperty(ID, val)
    player.sendMessage(`§l§a» §r§f${ID} was successfully saved! §7(${clean(val?.split("§:").join(", "))})`)
    player.playSound('random.orb')
}

const errorSend = (player, e) => {
    if (!e) player.sendMessage(`§c§l» §r§fError while processing your input: §c${e.message}`)
    else player.sendMessage(`§c§l» §r§fYou input not likely to be a number or exceeds the limit!`)

    player.playSound('random.break')
}

const a = {
    'campfire':
        'Lit Campfire',
    'durability':
        'Tool Durability',
    'float':
        'Floating ItemName',
    'harvest':
        'Hoe to Harvest',
    'hp':
        'Sync Health',
    'inv':
        'Sync Inv',
    'light':
        'Dynamic Light',
    'sort':
        'Stick Sort',
    'snOffhand':
        'sneak to offhand',
    'stackMob':
        'stackMob'
}