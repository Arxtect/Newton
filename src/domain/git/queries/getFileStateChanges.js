import * as git from "isomorphic-git";
import fs from "fs";
export async function getFileStateChanges(commitHash1, commitHash2, dir) {
    return git.walk({
      fs,
      dir,
      trees: [git.TREE({ ref: commitHash1 }), git.TREE({ ref: commitHash2 })],
      map: async function(filepath, [A, B]) {
        // ignore directories
        if (filepath === '.') {
          return
        }
        if ((await A.type()) === 'tree' || (await B.type()) === 'tree') {
          return
        }
  
        // generate ids
        const Aoid = await A.oid()
        const Boid = await B.oid()
  
        // determine modification type
        let type = 'equal'
        if (Aoid !== Boid) {
          type = 'Edited'
        }
        if (Aoid === undefined) {
          type = 'Created'
        }
        if (Boid === undefined) {
          type = 'Deleted'
        }
        if (Aoid === undefined && Boid === undefined) {
          console.log('Something weird happened:')
          console.log(A)
          console.log(B)
        }
  
        return {
          path: `${filepath}`,
          type: type,
        }
      },
    })
  }
