import { readFile } from 'fs/promises'
import ts from 'typescript'
import * as fs from 'fs'
const {
    isCallExpression,
    forEachChild,
    isEnumDeclaration,
    isExportDeclaration,
    isImportDeclaration,
    isPropertyDeclaration,
    isStringLiteral,
    getModifiers,
    SyntaxKind,
    isTypeNode,
    isNamedExports,
    isNamedImports,
    isLiteralExpression,
    isFunctionLike,
    canHaveDecorators,
    getDecorators,
    isIdentifier,
    createSourceFile,
    ScriptTarget,
    ScriptKind,
} = ts
import enhanced from 'enhanced-resolve'
import { fileURLToPath } from 'url'
import { task } from '../../utils/task.js'
import { join } from 'path'
import { builtinModules } from 'node:module'

const pureMap = new Map<string, boolean>()
const dependencyMap = new Map<string, Set<string>>()
let resolver: ReturnType<typeof enhanced['create']>
export async function analyze() {
    resolver = enhanced.create({
        fileSystem: new enhanced.CachedInputFileSystem(fs, 10000),
        extensionAlias: {
            '.js': ['.tsx', '.ts', '.js'],
        },
        aliasFields: ['browser'],
        conditionNames: ['mask-src', 'import', 'require'],
        extensions: ['.tsx', '.ts', '.mjs', '.cjs', '.js', '.json'],
    })
    const entries = [fileURLToPath(new URL('../../../../mask/src/extension/popups/normal-client.tsx', import.meta.url))]
    for (const f of entries) {
        await analyzeFile(f)
    }
}
task(analyze, 'startup-performance-linter', 'analyze startup performance')

async function analyzeFile(path: string): Promise<void> {
    if (dependencyMap.has(path)) return

    const file = await resolveFile(path)
    if (!file) return

    const dependsOn = new Set<string>()
    collectRequire(dependsOn, file)
    const isPure = !forEachChild(file, (node) => isSideEffect(node, dependsOn))
    pureMap.set(path, isPure)

    dependencyMap.set(path, dependsOn)
    const dir = join(path, '../')
    outer: for (const dep of dependsOn) {
        if (builtinModules.includes(dep)) continue
        if (dep.startsWith('node:')) continue
        if (dep.endsWith('.node')) continue

        const target = await new Promise<string | null>((resolve) => {
            resolver({}, dir, dep, (err: any, result: string) => {
                if (err) return resolve(null)
                else resolve(result)
            })
        })
        if (!target) {
            console.warn('Failed to resolve', dep, 'from', path)
            continue
        }
        if (dependencyMap.has(target)) continue
        await analyzeFile(target)
    }
}

async function resolveFile(target: string) {
    if (
        !(
            target.endsWith('.ts') ||
            target.endsWith('.tsx') ||
            target.endsWith('.js') ||
            target.endsWith('.mjs') ||
            target.endsWith('.cjs')
        )
    ) {
        return null
    }
    const text = await readFile(target, 'utf-8')
    return createSourceFile(
        target,
        text,
        ScriptTarget.ESNext,
        true,
        target.endsWith('.tsx') ? ScriptKind.TSX : ScriptKind.TS,
    )
}

function collectRequire(deps: Set<string>, node: ts.Node) {
    function visit(node: ts.Node) {
        if (isCallExpression(node) && isIdentifier(node.expression) && node.expression.escapedText === 'require') {
            const [arg] = node.arguments
            if (isStringLiteral(arg)) deps.add(arg.text)
        }
        forEachChild(node, visit)
    }
    return forEachChild(node, visit)
}

function isSideEffect(n: ts.Node, dependsOn?: Set<string>): true | undefined {
    switch (n.kind) {
        case SyntaxKind.WhileStatement:
        case SyntaxKind.IfStatement:
        case SyntaxKind.ForStatement:
        case SyntaxKind.ForInStatement:
        case SyntaxKind.ForOfStatement:
        case SyntaxKind.LabeledStatement:
        case SyntaxKind.TryStatement:
        case SyntaxKind.ThrowStatement:
        case SyntaxKind.DoStatement:
        case SyntaxKind.SwitchStatement:
            return true
    }
    // actually it has, but we don't care in this case.
    if (isIdentifier(n)) return

    if (isTypeNode(n) || isLiteralExpression(n)) return
    if (isEnumDeclaration(n)) return

    if (canHaveDecorators(n) && getDecorators(n)?.length) return true

    if (isImportDeclaration(n)) {
        if (n.importClause?.isTypeOnly) return
        if (isStringLiteral(n.moduleSpecifier)) dependsOn?.add(n.moduleSpecifier.text)
    }
    if (isExportDeclaration(n)) {
        if (n.isTypeOnly) return
        if (n.moduleSpecifier && isStringLiteral(n.moduleSpecifier)) {
            dependsOn?.add(n.moduleSpecifier.text)
        }
    }
    if (isNamedExports(n) && n.elements.every((x) => x.isTypeOnly)) return
    if (isNamedImports(n) && n.elements.every((x) => x.isTypeOnly)) return

    if (isFunctionLike(n)) {
        if (n.name?.kind === SyntaxKind.ComputedPropertyName) return isSideEffect(n.name, dependsOn)
        return
    }
    if (isPropertyDeclaration(n)) {
        if (!n.initializer) return
        if (!getModifiers(n)?.some((x) => x.kind === SyntaxKind.StaticKeyword)) return
        return isSideEffect(n.initializer)
    }

    return forEachChild(n, isSideEffect)
}
