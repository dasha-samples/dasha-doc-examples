library


// import "types.dsl";

// block ConvertSlotToInnerSlot(slot: Slot): InnerSlot {
//     start node root {
//         do {
//             var s: {[x:string]:unknown;} = $slot;
//             set s["value"] = null;
//             set s["values"] = [];
//             var innerS = s as InnerSlot;
//             if (innerS is null) { #log("innerSlot is null"); exit; }
//             return innerS;
//         }
//     }
// }

block ParseEntities(entities: string[]): Data[] {
    start node root {
        do {
            var parsedData:Data[] = [];
            for (var e in $entities) {
                var split = e.split(":");
                var eName = split[0];
                if (eName is null) { #log("eName is null"); exit; }
                var eTag = split[1];

                var filter: Filter = {value: true, tag: false};
                if (eTag is not null) set filter.tag = eTag;
                var parsed = #messageGetData(eName, filter);
                // #log({eName: eName, filter: filter});
                // #log(parsed);
                parsedData.append(parsed);
            }
            return parsedData;
        }
    }
}


// block GetdropTriggers(slots: Slots): string[] {
//     start node root {
//         do {
//             var result: string[] = [];
//             for (var key in $slots.keys()) {
//                 var trigger = ($slots[key])?.triggers?.dropIntents;
//                 if (trigger is not null) {
//                     result.append(trigger);
//                 }
//             }
//             return result;
//         }
//     }
// }
block GetFirst(dataArray: Data[]): string? {
    start node root {
        do {
            for (var data in $dataArray)
                if (data.value is not null) return data.value;
            return null;
        }
    }
}
block GetAll(dataArray: Data[]): string[] {
    start node root {
        do {
            var result: string[] = [];
            for (var data in $dataArray) 
                if (data.value is not null) result.push(data.value);
            return result;
        }
    }
}
block IsInArray(element: string, array: string[]): boolean {
    start node root {
        do {
            for (var el in $array)
                if ($element == el) return true;
            return false;
        }
    }
}
block GetArrayIntersection(minuend: string[], subtrahend: string[]): string[] {
    block IsInArray(element: string, array: string[]): boolean {
        start node root {
            do {
                for (var el in $array)
                    if ($element == el) return true;
                return false;
            }
        }
    }
    start node root {
        do {
            var result: string[] = [];
            for (var s in $minuend) {
                var includes = blockcall IsInArray(s, $subtrahend);
                if (!includes)
                    result.push(s);
            }
            return result;
        }
    }
}
block GetFirstUnequal(element: string?, array: string[]): string? {
    start node root {
        do {
            for (var el in $array) {
                if (el != $element) return el;
            }
            return null;
        }
    }
}
block GetAllUnequal(element: string?, array: string[]): string[] {
    start node root {
        do {
            var result: string[] = [];
            for (var el in $array) {
                if (el != $element) result.push(el);
            }
            return result;
        }
    }
}
