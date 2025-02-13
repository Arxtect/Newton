import { create } from "zustand";
import { persist } from "zustand/middleware";
import * as Y from "yjs";
import { IndexeddbPersistence } from "y-indexeddb";
import fs from "fs";
import path from "path";
import pify from "pify";
import * as FS from "domain/filesystem";
import flatten from "lodash/flatten";
import { user } from "./useUserStore";
import { isArray } from "lodash";
import { readFileTree } from "../domain/filesystem/queries/readFileTree"

export const IGNORE_PATTERNS = [".git"];

  export const createYDocStore = (userId) =>
    create(
      persist(
        (set, get) => {
          if (!userId) throw new Error("User email is required to create YDocStore");
          
          const ydoc = new Y.Doc();
          const idbPersistence = new IndexeddbPersistence(`user-doc-${userId}`, ydoc);
          idbPersistence.on("synced", () => {
            console.log(`User ${userId}'s data has been loaded from IndexedDB.`);
            set({ ydoc }); 
          });
          
          return {
            userId,
            ydoc, 
            idbPersistence,
            getYDoc: () => ydoc,
            clearIndexedDB: () => {
              const dbName = `user-doc-${userId}`;
              const request = indexedDB.deleteDatabase(dbName);
              request.onsuccess = function () {
                console.log(`IndexedDB database "${dbName}" has been successfully deleted.`);
              };
              request.onerror = function (event) {
                console.error("Failed to delete IndexedDB:", event);
              };
           },
            createYDocFromPath: async (rootPath) => {
              const projectsMap = ydoc.getMap("projectsMap"); 
              const rootNode = await readFileTree(rootPath);
            
              const stack = [{ node: rootNode, ymap: projectsMap }];
              while (stack.length > 0) {
                const { node, ymap } = stack.pop();
                if(node === rootNode || node.type === "dir") {
                  const dirMap = new Y.Map();
                  const filepath = (node === rootNode ? rootPath : node.filepath);
                  ymap.set(path.basename(filepath), dirMap);
                  if(node === rootNode) {
                    node.forEach(childNode => {
                      stack.push({ node: childNode, ymap: dirMap });
                    })
                  } 
                  else if (Array.isArray(node.children) && node.children.length > 0) {
                    node.children.forEach((childNode) => {
                      stack.push({ node: childNode, ymap: dirMap });
                    });
                  }
                }
                else if (node.type === "file" && !node.filepath.includes("project-hasOwnProperty-arxtect-projectInfo")) {
                  const fileContent = await FS.readFile(node.filepath);
                  const ytext = new Y.Text();
                  ytext.insert(0, fileContent.toString());
                  ymap.set(path.basename(node.filepath), ytext);
                  console.log(path.basename(node.filepath), ytext.toString(), "ytext");
                } 
              }
              set({ ydoc }); 
            },
          };
        },
        {
          name: `user-store-${userId}`,
          version: 1, 
        }
      )
    );

export const useYDocStore = (userId) => createYDocStore(userId);