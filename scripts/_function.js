import { system, Block } from "@minecraft/server"
export const blockRayCast = { includeLiquidBlocks: true, includePassableBlocks: false, maxDistance: 9 }
export const DEBUG = false

/** @returns {String} */
export function getBlock(block, isPermutation = false) { return isPermutation ? block.getItemStack(1).typeId : block.permutation.getItemStack(1).typeId }
/** @returns {String} */
export function reName(item) { return item.split(":")[1].split('_').map(v => v[0].toUpperCase() + v.slice(1).toLowerCase()).join(" ") }
/** @returns {Promise} */
export function wait(ticks) { return new Promise((resolve) => { system.runTimeout(resolve, ticks) }) }
/** @returns {Boolean} */
export function check(a, b) { a.length === b.length && a.every(x => b.some(y => JSON.stringify(x) === JSON.stringify(y))) }
/** @param {Block} block @returns {Boolean}  */
export function isFrame(block) { return block.permutation.matches('minecraft:frame') || block.permutation.matches('minecraft:glow_frame') }