import ActorSheet5eNPCNew from "../../../systems/sw5e/module/actor/sheets/newSheet/npc.js";

class GlobalInvSheetSW5e extends ActorSheet5eNPCNew {
    /** @override */
    get template() {
        if ( !game.user.isGM && this.actor.limited ) return "systems/sw5e/templates/actors/newActor/limited-sheet.html";
        return "modules/global-inventory/templates/globalinventory.html";
    }

    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["sw5e", "sheet", "actor", "npc", "global-inv-sheet"],
            width: 890,
            height: 750,
            tabs: [{
                navSelector: ".root-tabs",
                contentSelector: ".sheet-body",
                initial: "attributes"
            }],
        });
    }

    async getData() {
        const sheetData = super.getData();

        return sheetData;
    }

    /**
     * Organize and classify Owned Items for Character sheets
     * @private
     */
    _prepareItems(data) {

        // Categorize items as inventory, powerbook, features, and classes
        const inventory = {
            weapon: { label: "SW5E.ItemTypeWeaponPl", items: [], dataset: {type: "weapon"} },
            equipment: { label: "SW5E.ItemTypeEquipmentPl", items: [], dataset: {type: "equipment"} },
            consumable: { label: "SW5E.ItemTypeConsumablePl", items: [], dataset: {type: "consumable"} },
            tool: { label: "SW5E.ItemTypeToolPl", items: [], dataset: {type: "tool"} },
            backpack: { label: "SW5E.ItemTypeContainerPl", items: [], dataset: {type: "backpack"} },
            loot: { label: "SW5E.ItemTypeLootPl", items: [], dataset: {type: "loot"} }
        };

        // Partition items by category
        let [items] = data.items.reduce((arr, item) => {

            // Item details
            item.img = item.img || DEFAULT_TOKEN;
            item.isStack = Number.isNumeric(item.data.quantity) && (item.data.quantity !== 1);
            item.attunement = {
                [CONFIG.SW5E.attunementTypes.REQUIRED]: {
                    icon: "fa-sun",
                    cls: "not-attuned",
                    title: "SW5E.AttunementRequired"
                },
                [CONFIG.SW5E.attunementTypes.ATTUNED]: {
                    icon: "fa-sun",
                    cls: "attuned",
                    title: "SW5E.AttunementAttuned"
                }
            }[item.data.attunement];

            // Item usage
            item.hasUses = item.data.uses && (item.data.uses.max > 0);
            item.isOnCooldown = item.data.recharge && !!item.data.recharge.value && (item.data.recharge.charged === false);
            item.isDepleted = item.isOnCooldown && (item.data.uses.per && (item.data.uses.value > 0));
            item.hasTarget = !!item.data.target && !(["none",""].includes(item.data.target.type));

            // Classify items into types
            if ( Object.keys(inventory).includes(item.type ) ) arr[0].push(item);
            return arr;
        }, [[]]);

        // Apply active item filters
        items = this._filterItems(items, this._filters.inventory);

        // Organize items
        for ( let i of items ) {
            i.data.quantity = i.data.quantity || 0;
            i.data.weight = i.data.weight || 0;
            i.totalWeight = Math.round(i.data.quantity * i.data.weight * 10) / 10;
            inventory[i.type].items.push(i);
        }

        // Assign and return
        data.inventory = Object.values(inventory);
    }
}

//Register the sheet
// @ts-ignore
Actors.registerSheet("sw5e", GlobalInvSheetSW5e, {
    types: ["npc"],
    makeDefault: false,
    label: "SW5E.GlobalInvSheetSW5e"
});

const MoveItems = ["weapon", "equipment", "consumable", "tool", "backpack", "loot"]

Hooks.on('dropActorSheetData',(target,sheet,dragSource, user)=>{
    if (dragSource.actorId && dragSource.type === "Item") {
        let sourceActor = game.actors.get(dragSource.actorId);


        if (target.data._id === dragSource.actorId) return;
        if (!(sheet.object.owner && sourceActor.owner)) return;

        if (MoveItems.includes(dragSource.data.type)) {

            if (sourceActor) {
                sourceActor.deleteOwnedItem(dragSource.data._id);
            }
        } else if (sheet instanceof GlobalInvSheetSW5e) {
            const message = "You cannot move an item on type " + dragSource.data.type + " into the global inventory";
            console.error('GlobalInv: ', message);
            ui.notifications.error('GlobalInv: ' + message);
            return false;
        }
    }
});