class ItemTargetingUtils5e {
  static MODULE_NAME = "item-targeting-utils-5e";
  static MODULE_TITLE = "Item Targeting Utilities DnD5e";

  static init = async () => {
    console.log(`${this.MODULE_NAME} | Initializing ${this.MODULE_TITLE}`);

    ItemTargetingUtils5eItem.patchItemRoll();
  }

}

Hooks.on("ready", ItemTargetingUtils5e.init);

/**
 * Handles all the logic related to Items
 */
class ItemTargetingUtils5eItem {

  /**
   * A Brittle way to allow the Item Roll workflow to wait until a measured template is placed before completing.
   * This makes several very brittle assumptions about the order that certain hooks are fired in.
   * 
   * This will be removed if/when the item workflow is changed to behave this way by default.
   * 
   * @returns {Promise} Promise that resolves when the template placement workflow finishes
   */
  static async jankyWaitForTemplate() {
    return new Promise(resolve => {
      console.log('waiting for template first!')

      Hooks.once('createMeasuredTemplate', (measuredTemplateDocument) => resolve(measuredTemplateDocument));

      const cancelBack = (controls) => {
        if (controls.activeControl !== 'measure') {
          Hooks.off('createMeasuredTemplate', resolve);
          resolve(null);
        }
      }

      // cleans up createMeasuredTemplate hook if the user cancels out of the measure template
      // happens before createMeasuredTemplate sometimes
      Hooks.once('renderSceneControls', cancelBack);

      // always happens before renderSceneControls in cases where the user is actually placing a
      // measured template
      Hooks.once('preCreateMeasuredTemplate', () => {
        Hooks.off('renderSceneControls', cancelBack);
      });

    })
  }

  /**
   * Patch for Item5e.roll which makes it not create the chat message or resolve its promise until after
   * the user places a measured template in cases where a measured template is expected
   * @param {*} wrapped 
   * @param {*} config 
   * @param  {...any} args 
   * @returns 
   */
  static async itemRollPatch(wrapped, config, ...args) {
    // Force our call to the original Item5e#roll to not show a chat card, but remember whether *our* caller wants a chat message or not
    // If the caller above us set createMessage to false, we should not create a chat card and instead just return our message data.
    const originalCreateMessage = config?.createMessage ?? true;

    const newConfig = {
      ...config,
      createMessage: false
    }

    const messageData = await wrapped(newConfig, ...args);

    // the user has aborted the item usage
    if (!messageData) return;

    const itemHasTemplateFirst = this.hasAreaTarget && game.user.can("TEMPLATE_CREATE") && canvas.activeLayer instanceof TemplateLayer;

    if (itemHasTemplateFirst) {
      // this template might be useful here someday
      const _template = await ItemTargetingUtils5eItem.jankyWaitForTemplate();
    }

    // const itemHasAllyEnemyTargets = ['ally', 'enemy'].includes(this.data.data.target?.type) && !!this.data.data.range?.value && !!this.data.data.range?.units;

    // if (itemHasAllyEnemyTargets) {
    //   ItemTargetingUtils5eToken.getAllyEnemyTargets(item);
    // }

    const result = originalCreateMessage ? await ChatMessage.create(messageData) : messageData;
    return result;
  }

  static patchItemRoll() {
    libWrapper.register(ItemTargetingUtils5e.MODULE_NAME, "CONFIG.Item.documentClass.prototype.roll", this.itemRollPatch, "WRAPPER");
  }

}

// /**
//  * Handles all the logic related to Tokens
//  */
// class ItemTargetingUtils5eToken {
//   static getAllyEnemyTargets(item) {
//     const actor = item.actor;
//   }

//   static getRollingToken(item) {

//   }
// }


/**
 * Handles all the logic related to Users
 */
class ItemTargetingUtils5eUser {
  /**
   * Update the user's targets with all tokens inside a given template
   * @param {*} template 
   */
  static updateUserTargets(template) {
    const templateTargetIds = ItemTargetingUtils5eTemplate.getTokensInside(template).map((token) => token.document.id);

    game.user?.updateTokenTargets(templateTargetIds);
    game.user?.broadcastActivity({ targets: templateTargetIds });
  }
}

/**
 * Handles all the logic related to Templates
 */
class ItemTargetingUtils5eTemplate {
  /**
   * Iterates on all tokens on the canvas to determine which are within the template.
   *
   * @param {*} template The template to be checked
   * @returns {Array<Token>} Array of tokens which are inside the given template
   */
  static getTokensInside(template) {
    if (!canvas) return [];

    const allTokens = canvas.tokens?.placeables ?? [];

    return allTokens.filter((token => this.isTokenInside(template, token)))
  }

  /**
   * Determines if a Token can be targeted by a measure template.
   * Checks if any square the token occupies is highlighted by the template.
   * Checks if there is a wall preventing movement from the template origin.
   * 
   * Modified from Midi-QOL `isTokenInside`
   * @param {*} template The template being checked
   * @param {*} token The token being checked
   * @returns 
   */
  static isTokenInside(template, token) {
    if (!canvas) return false;

    // Grid Size
    const grid = canvas.scene?.data.grid;
    const templateData = { ...template.data };

    // Check for the center of each square the token uses.
    // e.g. for large tokens all 4 squares
    const startX = token.data.width >= 1 ? 0.5 : (token.data.width / 2);
    const startY = token.data.height >= 1 ? 0.5 : (token.data.height / 2);

    // iterate over every grid space the token occupies
    // return true if any space works
    for (let x = startX; x < token.data.width; x++) {
      for (let y = startY; y < token.data.height; y++) {
        const currGrid = {
          x: token.data.x + x * grid - templateData.x,
          y: token.data.y + y * grid - templateData.y,
        };

        let contains = !!template.shape?.contains(currGrid.x, currGrid.y);

        if (contains) {
          let tx = templateData.x;
          let ty = templateData.y;
          if (template.shape.type === 1) { // A rectangle
            tx = tx + template.shape.width / 2;
            ty = ty + template.shape.height / 2;
          }
          const r = new Ray({ x: tx, y: ty }, { x: currGrid.x + templateData.x, y: currGrid.y + templateData.y });

          contains = !canvas.walls?.checkCollision(r, { type: 'movement' });
        }

        if (contains) return true;
      }
    }
    return false;
  }
}

Hooks.on('createMeasuredTemplate', (measuredTemplateDocument, _options, userId) => {
  if (game.userId !== userId) return;
  ItemTargetingUtils5eUser.updateUserTargets(measuredTemplateDocument.object);
});

Hooks.on('updateMeasuredTemplate', (measuredTemplateDocument, _diff, _options, userId) => {
  if (game.userId !== userId) return;
  ItemTargetingUtils5eUser.updateUserTargets(measuredTemplateDocument.object);
});
