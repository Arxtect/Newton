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
import { v4 as uuidv4 } from 'uuid';
import { readFileTree } from "../domain/filesystem/queries/readFileTree"

export const IGNORE_PATTERNS = [".git"];

  export const createYDocStore = (userId) =>
    create(
      persist(
        (set, get) => {
          if (!userId) throw new Error("User email is required to create YDocStore");
          
          const ydoc = new Y.Doc({ gc: false });
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

           //Creating YDoc from Indexeddb.
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
                } 
              }
              set({ ydoc }); 
            },

            // updateYDoc: async (rootPath) => {
            // },

            // updateData: async (rootPath) => {
            //},

            // add snapshot's name (If needed)
            saveSnapshot: async (rootPath) => {
              const snapshotsMap = ydoc.getMap("snapshotsMap");
              // It is best to define an unique ID for each project here, not rootPath.
              // If the project is renamed, it will not be found
              let snapshotMap = snapshotsMap.get(rootPath);
              if(!snapshotMap) {
                snapshotMap = new Y.Map();
                snapshotsMap.set(rootPath, snapshotMap);
              }
              const snapshotId = uuidv4();
              // Ensure that the current ydoc stores the current project status.
              // updateYDoc(rootPath);
              const snapshot = Y.snapshot(ydoc);
              const encodedSnapshot = Y.encodeSnapshot(snapshot);
              const creationTime = new Date();
              snapshotMap.set(snapshotId, { encodedSnapshot, creationTime, snapshotId });
              set({ ydoc }); 
            }, 

            loadSnapshot: async (rootPath, snapshotId) => {
              const snapshotsMap = ydoc.getMap("snapshotsMap");
              const snapshotMap = snapshotsMap.get(rootPath);
              
              if(!snapshotMap.has(snapshotId)) {
                console.error("Illegal snapshotId!");
                return;
              }

              const snapshotInfo = snapshotMap.get(snapshotId);
              const { encodedSnapshot } = snapshotInfo;
              const decodedSnapshot = Y.decodeSnapshot(encodedSnapshot);
              const tempDoc = Y.createDocFromSnapshot(ydoc, decodedSnapshot);
              const restoredProjectsMap = tempDoc.getMap("projectsMap");
              const restoredProjectMap = restoredProjectsMap.get(rootPath);
              const originalProjectsMap = ydoc.getMap("projectsMap");
              const originalProjectMap = originalProjectsMap.get(rootPath);

              ydoc.transact(() => {
                copyYMap(restoredProjectMap, originalProjectMap)
              });
              set({ ydoc }); 
              //then (Re-render the Newton interface) and (update the project data: updateData) based on the ydoc.
            },

            deleteSnapshot: async (rootPath, snapshotId) => {
              const snapshotsMap = ydoc.getMap("snapshotsMap");
              const snapshotMap = snapshotsMap.get(rootPath);
              if(!snapshotMap.has(snapshotId)) {
                console.error("Illegal snapshotId!");
                return;
              }
              snapshotMap.delete(snapshotId);
              set({ ydoc });
            },

            getSnapshotInfo: async (rootPath) => {
              const snapshotsMap = ydoc.getMap("snapshotsMap");
              const snapshotMap = snapshotsMap.get(rootPath);
              if(!snapshotMap.size) {
                return [];
              }
              const snapshotInfoArray = [];
              for (const [snapshotKey, snapshotEntry] of snapshotMap) {
                const { snapshotId, creationTime } = snapshotEntry;
                snapshotInfoArray.push({ snapshotId, creationTime });
              }
              return snapshotInfoArray;
            },
          };
        },
        {
          name: `user-store-${userId}`,
          version: 1, 
        }
      )
    );

    const copyYMap = (sourceMap, targetMap) => {
      const stack = [];
      stack.push({ source: sourceMap, target: targetMap });
    
      while (stack.length > 0) {
        const { source, target } = stack.pop();
        source.forEach((value, key) => {
          if (value instanceof Y.Map) {
            const newMap = new Y.Map();
            target.set(key, newMap);
            stack.push({ source: value, target: newMap });
          } else if (value instanceof Y.Text) {
            const newText = new Y.Text();
            newText.insert(0, value.toString());
            target.set(key, newText);
          } else {
            target.set(key, value);
          }
        });
      }
    };
export const useYDocStore = (userId) => createYDocStore(userId);