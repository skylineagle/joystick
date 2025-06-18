import { useEffect, useState } from "react";
import { toast } from "@/utils/toast";

export function PirateEasterEgg() {
  const [isPirateMode, setIsPirateMode] = useState(false);

  // Listen for the secret key combination (Alt+P)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F4") {
        e.preventDefault();
        setIsPirateMode((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Apply pirate mode when activated
  useEffect(() => {
    if (!isPirateMode) {
      // Restore original text
      const pirateElements = document.querySelectorAll("[data-original-text]");
      pirateElements.forEach((element) => {
        const originalText = element.getAttribute("data-original-text");
        if (originalText) {
          element.textContent = originalText;
          element.removeAttribute("data-original-text");
        }
      });
      return;
    }

    // Show toast notification
    toast.success({ message: "Yarr! Pirate mode activated, matey! 🏴‍☠️" });

    // Pirate vocabulary for text replacement
    const pirateReplacements: Record<string, string> = {
      hello: "ahoy",
      hi: "ahoy",
      my: "me",
      friend: "matey",
      friends: "crew",
      everyone: "all hands",
      yes: "aye",
      no: "nay",
      is: "be",
      are: "be",
      am: "be",
      the: "th'",
      you: "ye",
      your: "yer",
      for: "fer",
      very: "mighty",
      money: "doubloons",
      treasure: "booty",
      boss: "cap'n",
      manager: "cap'n",
      sorry: "arrr",
      "excuse me": "arrr",
      ok: "aye",
      okay: "aye",
      right: "aye",
      sure: "aye",
      address: "port o' call",
      restaurant: "galley",
      hotel: "fleabag inn",
      bar: "grog house",
      food: "grub",
      drink: "grog",
      man: "landlubber",
      woman: "lass",
      guy: "matey",
      sir: "matey",
      madam: "proud beauty",
      miss: "comely wench",
      stranger: "scurvy dog",
      buddy: "matey",
      boy: "cabin boy",
      girl: "lass",
      children: "little scallywags",
      kids: "little scallywags",
      internet: "high seas",
      website: "port",
      computer: "vessel",
      email: "message in a bottle",
      dashboard: "captain's quarters",
      settings: "ship's log",
      profile: "wanted poster",
      login: "board",
      logout: "walk the plank",
      "sign in": "board",
      "sign out": "walk the plank",
      password: "secret code",
      loading: "hoisting the mainsail",
      search: "spy",
      find: "seek",
      help: "aid",
      contact: "hail",
      about: "tale of",
      home: "ship",
      start: "set sail",
      stop: "belay",
      delete: "send to Davy Jones' locker",
      erase: "maroon",
      edit: "scribble",
      update: "modernize",
      create: "craft",
      new: "fresh",
      save: "stow",
      cancel: "belay",
      close: "batten down",
      open: "unfurl",
      message: "parley",
      notification: "hail",
      alert: "warning shot",
      error: "blimey",
      success: "treasure found",
      welcome: "ahoy",
      goodbye: "fair winds",
      thanks: "thankee",
      "thank you": "thankee",
      please: "if ye be so kind",
      device: "vessel",
      devices: "fleet",
      terminal: "crow's nest",
      actions: "commands",
      params: "ship's manifest",
      stream: "current",
      view: "spy",
      select: "choose",
      filter: "sift",
      sort: "arrange",
      add: "append",
      remove: "jettison",
      clear: "swab",
      reset: "start anew",
      refresh: "rejuvenate",
      reload: "rearm",
      restart: "relaunch",
      joystick: "helm",
    };

    // Function to convert text to pirate speak
    const toPirateSpeak = (text: string): string => {
      if (!text) return text;

      let pirateText = text;

      // Replace words with pirate equivalents
      Object.entries(pirateReplacements).forEach(([word, replacement]) => {
        const regex = new RegExp(`\\b${word}\\b`, "gi");
        pirateText = pirateText.replace(regex, replacement);
      });

      // Add pirate phrases randomly
      const piratePhrases = [
        " Arr!",
        " Yarr!",
        " Avast!",
        " Ahoy!",
        " Aye aye!",
        " Shiver me timbers!",
        " Yo-ho-ho!",
        " Blimey!",
        " By Blackbeard's beard!",
        " Savvy?",
      ];

      // 20% chance to add a pirate phrase at the end of the text
      if (Math.random() < 0.2 && pirateText.length > 10) {
        const randomPhrase =
          piratePhrases[Math.floor(Math.random() * piratePhrases.length)];
        pirateText = pirateText + randomPhrase;
      }

      return pirateText;
    };

    // Get all text elements
    const textElements = document.querySelectorAll(
      "p, h1, h2, h3, h4, h5, h6, span, button, a, label, li"
    );

    // Replace text with pirate speak
    textElements.forEach((element) => {
      // Skip elements that have already been processed
      if (element.hasAttribute("data-original-text")) return;

      // Skip elements with no text content
      if (!element.textContent?.trim()) return;

      // Store original text
      element.setAttribute("data-original-text", element.textContent);

      // Replace with pirate speak
      element.textContent = toPirateSpeak(element.textContent);
    });

    // Set a timeout to deactivate pirate mode after 2 minutes
    const timeout = setTimeout(() => {
      setIsPirateMode(false);
      toast.success({
        message: "Pirate mode deactivated. Back to landlubber speak!",
      });
    }, 2 * 60 * 1000);

    return () => {
      clearTimeout(timeout);
    };
  }, [isPirateMode]);

  return null;
}
