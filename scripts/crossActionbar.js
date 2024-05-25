import { world, system } from "@minecraft/server"

system.runInterval(() => system.run(() => {
    const players = world.getAllPlayers()
    players.map(plr => {
        plr.getDynamicPropertyIds().filter(dy => dy === 'request.actionbar').map(dy => {
            plr.onScreenDisplay.setActionBar(`${plr.getDynamicProperty(dy)}`)
            plr.setDynamicProperty(dy, undefined)
        })
    })
}))