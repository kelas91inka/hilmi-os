export type RollbackFunction = () => Promise<void>;

export class TransactionLayer {
  /**
   * Executes a series of operations with a JS-based Soft Rollback mechanism.
   * If any operation fails, the previously registered rollback functions are executed
   * in reverse order to restore the state.
   */
  static async execute<T>(
    operationName: string,
    transactionBlock: (
      registerRollback: (fn: RollbackFunction) => void
    ) => Promise<T>
  ): Promise<T> {
    const rollbacks: RollbackFunction[] = [];
    
    const registerRollback = (fn: RollbackFunction) => {
      rollbacks.push(fn);
    };

    try {
      return await transactionBlock(registerRollback);
    } catch (error: any) {
      console.error(`[Transaction] ${operationName} failed. Initiating rollback...`, error);
      
      // Execute rollbacks in reverse order
      for (let i = rollbacks.length - 1; i >= 0; i--) {
        try {
          await rollbacks[i]();
        } catch (rollbackError) {
          // If a rollback fails, it's a critical error (data inconsistency)
          console.error(`[CRITICAL] Rollback failed during ${operationName}:`, rollbackError);
        }
      }

      throw new Error(`Transaksi gagal dan telah di-rollback. Penyebab: ${error.message}`);
    }
  }
}
