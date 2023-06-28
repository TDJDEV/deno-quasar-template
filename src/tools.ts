// ================ PRIVATE ================ //

// Imports
import { useSlots, defineAsyncComponent } from "vue";
import html from "@/components/core/htmlTag.vue";

/* Functions */

const Mimes = {
  aac:  "audio/aac",
  apng: "image/apng",
  avi:  "video/x-msvideo",
  avif: "image/avif",
  gif:  "image/gif",
  jpeg: "image/jpeg",
  jpg:  "image/jpeg",
  mp3:  "audio/mpeg",
  mp4:  "video/mp4",
  mpeg: "video/mpeg",
  oga:  "audio/ogg",
  ogv:  "video/ogg",
  png:  "image/png",
  svg:  "image/svg+xml",
  tif:  "image/tiff",
  tiff: "image/tiff",
  wav:  "audio/wav",
  weba: "audio/webm",
  webm: "video/webm",
  webp: "image/webp",
}


// ================ PUBLIC ================ //

// Module
export function getSlotContent(key:string = "default") {
  const Slot = useSlots()[key];
  return Slot ? Slot()[0].children : [];
}
export const importComponent = (name:string) => defineAsyncComponent(() => import(`@/components/custom/${name}.vue`).catch(() => html))
export const getMime = {
  ext(type:string){ 
    return Object.entries(Mimes).find(function([currext,currtype]){ return type == currtype })?.shift()
  },
  type(ext:string){
    return Object.entries(Mimes).find(function([currext,currtype]){ return ext == currext })?.pop()
  }
}
