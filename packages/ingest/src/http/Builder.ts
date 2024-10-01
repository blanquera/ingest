import type { ProjectOptions } from 'ts-morph';
import type { 
  BuilderOptions,
  BuildOptions,
  Transpiler
} from '../buildtime/types';
import Router from '../buildtime/Router';

import { IndentationText, VariableDeclarationKind } from 'ts-morph';
import { createSourceFile } from '../buildtime/helpers';

export default class Builder {
  //router
  protected _router: Router;
  //ts-morph options
  protected _tsconfig: ProjectOptions;

  /**
   * Sets the context and options
   */
  public constructor(router: Router, options: BuilderOptions = {}) {
    this._router = router;
    this._tsconfig = {
      tsConfigFilePath: options.tsconfig,
      skipAddingFilesFromTsConfig: true,
      compilerOptions: {
        // Generates corresponding '.d.ts' file.
        declaration: true, 
        // Generates a sourcemap for each corresponding '.d.ts' file.
        declarationMap: true, 
        // Generates corresponding '.map' file.
        sourceMap: true
      },
      manipulationSettings: {
        indentationText: IndentationText.TwoSpaces
      }
    };
  }

  /**
   * Creates an entry file
   */
  public transpile(entries: string[]) {
    //create a new source file
    const { source } = createSourceFile('entry.ts', this._tsconfig);
    //import task1 from [entry]
    entries.forEach((entry, i) => {
      source.addImportDeclaration({
        moduleSpecifier: entry,
        defaultImport: `task_${i}`
      });
    });
    //import TaskQueue from '@blanquera/ingest/dist/runtime/TaskQueue';
    source.addImportDeclaration({
      moduleSpecifier: '@blanquera/ingest/dist/runtime/TaskQueue',
      defaultImport: 'TaskQueue'
    });
    //const queue = new TaskQueue();
    source.addVariableStatement({
      declarationKind: VariableDeclarationKind.Const,
      declarations: [{
        name: 'queue',
        initializer: 'new TaskQueue()'
      }]
    });
    //queue.add(task_0);
    entries.forEach((_, i) => {
      source.addStatements(`queue.add(task_${i});`);
    });
    source.addStatements('exports.queue = queue;');
    return source;
  }

  /**
   * Builds the final entry files
   */
  public async build(options: BuildOptions = {}) {
    const manifest = this._router.manifest(options);
    const transpiler: Transpiler = entries => {
      return this.transpile(entries);
    }
    return await manifest.build(transpiler);
  }
}