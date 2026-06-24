import {addIcons} from "ionicons";
import {defineCustomElement as defineIonIcon} from "ionicons/components/ion-icon.js";
import {
    arrowRedoOutline,
    arrowUndoOutline,
    codeSlashOutline,
    documentOutline,
    downloadOutline,
    expandOutline,
    hardwareChipOutline,
    helpCircleOutline,
    refreshOutline,
    searchOutline,
} from "ionicons/icons";

addIcons({
    "arrow-redo-outline": arrowRedoOutline,
    "arrow-undo-outline": arrowUndoOutline,
    "code-slash-outline": codeSlashOutline,
    "document-outline": documentOutline,
    "download-outline": downloadOutline,
    "expand-outline": expandOutline,
    "hardware-chip-outline": hardwareChipOutline,
    "help-circle-outline": helpCircleOutline,
    "refresh-outline": refreshOutline,
    "search-outline": searchOutline,
});

defineIonIcon();
