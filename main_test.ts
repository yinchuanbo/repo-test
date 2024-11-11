import { assertEquals } from "@std/assert";
import { add } from "./repo/js/global.js";

Deno.test(function addTest() {
  assertEquals(add(2, 3), 5);
});
