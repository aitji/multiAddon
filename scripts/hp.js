import { world, system, EquipmentSlot, EntityHealthComponent } from "@minecraft/server"
import { rep, wait } from "./_function"
import { get } from "./main"

let lastHealth = 20
const overworld = world.getDimension("overworld")
world.gameRules.showDeathMessages = true
const ID = 'hp'

world.afterEvents.playerSpawn.subscribe((data) => system.run(() => {
    if (!get(ID)) return
    data.player.getComponent("health").setCurrentValue(lastHealth)
}))

world.afterEvents.entityHealthChanged.subscribe((data) => {
    if (!get(ID)) return
    const DY = world.getDynamicProperty(ID) || `{ded} just did a oop!§:1§:1`
    const [dis, die, sound] = DY.split('§:')
    system.run(async () => {
        if (data.entity.getComponent("health").currentValue === lastHealth) return
        const players = world.getAllPlayers().filter(plr => plr.name !== data.entity.name)
        if (players.length < 1 && die === '0') return
        if (data.newValue <= 0) world.gameRules.showDeathMessages = false

        let cache = rep(dis, '{ded}', data.entity.name)
        cache = rep(cache, '{cause}', data.cause)
        const cache_sound_bool = (sound || '1' === '1')
        for (const pl of players) {
            const c = rep(cache, '{name}', pl.name)
            /** @type {EntityHealthComponent} */
            const hp = pl.getComponent("health")
            if (data.newValue < lastHealth && cache_sound_bool) pl.playSound('game.player.hurt', { volume: 0.3 })
            hp.setCurrentValue(data.newValue)
            if (data.newValue <= 0) pl.sendMessage(`${c}`)
        }
        lastHealth = data.newValue
        world.gameRules.showDeathMessages = true
    })
}, { entityTypes: ["minecraft:player"] })

world.afterEvents.entityDie.subscribe((data) => {
    if (!get(ID)) return
    system.run(() => {
        lastHealth = 20
        data.deadEntity.getComponent("health").setCurrentValue(20)
    })
}, { entityTypes: ["minecraft:player"] })