import { world, system } from "@minecraft/server"
system.runInterval(() => system.run(() => {
    const players = world.getAllPlayers()
    players.forEach(plr => {
        const display = []
        const dynamicProperty = plr.getDynamicPropertyIds().filter(dy => dy.startsWith(`actionbar§:`))
        dynamicProperty.forEach(dy => {
            const tir = plr.getDynamicProperty(dy)
            if (tir <= 0) plr.setDynamicProperty(dy, undefined)
            else {
                display.push(dy.slice(11))
                plr.setDynamicProperty(dy, tir - 1)
            }
        })
        plr.onScreenDisplay.setActionBar(display.join("\n§r"))
    })
}), 1)