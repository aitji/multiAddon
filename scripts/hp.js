import { world, system, EquipmentSlot, EntityHealthComponent } from "@minecraft/server"
import { wait } from "./_function"

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
    system.run(async () => {
        if (data.entity.getComponent("health").currentValue === lastHealth) return
        const players = world.getAllPlayers().filter(plr => plr.name !== data.entity.name)
        if (players.length < 1) return
        if (data.newValue <= 0) world.gameRules.showDeathMessages = false
        for (const pl of players) {
            /** @type {EntityHealthComponent} */
            const hp = pl.getComponent("health")
            if (data.newValue < lastHealth) pl.playSound('game.player.hurt', { volume: 0.3 })
            hp.setCurrentValue(data.newValue)
            if (data.newValue <= 0) pl.sendMessage(`§7${data.entity.name} just make you ded!`)
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