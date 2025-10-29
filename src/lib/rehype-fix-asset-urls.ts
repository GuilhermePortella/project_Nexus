import { visit } from "unist-util-visit";
import type { Root } from "hast";
import type { Element } from "hast";


const ASSET_TAGS = new Set(["img", "source", "video", "audio"]);
const ATTRS = ["src", "srcset", "poster", "data-src", "href"];

function rewrite(value: string): string {
   if (!value) return value;

   if (value.includes(",") && value.includes(" ")) {
      const parts = value.split(",").map(s => s.trim());
      const fixed = parts.map(p => {
         const [url, size] = p.split(/\s+/, 2);
         return `${rewrite(url)}${size ? " " + size : ""}`;
      });
      return fixed.join(", ");
   }

   if (value.startsWith("/") || value.startsWith("http") || value.startsWith("data:")) return value;

   if (value.startsWith("./")) return "/content/" + value.replace(/^.\//, "");
   if (value.startsWith("../")) return "/content/" + value.replace(/^(\.\.\/)+/, "");
   if (value.startsWith("content/")) return "/" + value;
   
   if (value.startsWith("./")) return "/images/" + value.replace(/^.\//, "");
   if (value.startsWith("../")) return "/images/" + value.replace(/^(\.\.\/)+/, "");
   if (value.startsWith("content/")) return "/images/" + value.replace(/^content\//, "");


   return value;
}

export default function rehypeFixAssetUrls() {
   return (tree: Root) => {
      visit(tree, "element", (node: Element) => {
         const tag = String(node.tagName || "").toLowerCase();
         if (ASSET_TAGS.has(tag) || tag === "a") {
            for (const attr of ATTRS) {
               const v = node.properties?.[attr];
               if (typeof v === "string") {
                  node.properties[attr] = rewrite(v);
               }
            }
         }
      });
   };
}
