import type { Module, Lesson } from '../types';

// Course content mapping -- derived from the original claude-howto modules
// Rebranded as clrClaude training platform

function makeLessons(moduleId: string, moduleNum: string, files: { slug: string; title: string }[]): Lesson[] {
  return files.map((file, index) => ({
    id: `${moduleId}-${file.slug}`,
    moduleId,
    title: file.title,
    slug: file.slug,
    contentPath: `/${moduleNum}/${file.slug === 'overview' ? 'README.md' : file.slug + '.md'}`,
    order: index + 1,
  }));
}

export const modules: Module[] = [
  {
    id: 'slash-commands',
    number: 1,
    title: 'Slash Commands',
    slug: 'slash-commands',
    description: 'User-invoked shortcuts for common workflows -- commit, PR, optimize, test, and more.',
    estimatedMinutes: 60,
    lessons: makeLessons('slash-commands', '01-slash-commands', [
      { slug: 'overview', title: 'Slash Commands Overview' },
      { slug: 'commit', title: 'Commit Command' },
      { slug: 'pr', title: 'Pull Request Command' },
      { slug: 'optimize', title: 'Optimize Command' },
      { slug: 'push-all', title: 'Push All Command' },
      { slug: 'generate-api-docs', title: 'Generate API Docs' },
      { slug: 'doc-refactor', title: 'Document Refactor' },
      { slug: 'unit-test-expand', title: 'Expand Unit Tests' },
      { slug: 'setup-ci-cd', title: 'Setup CI/CD' },
    ]),
  },
  {
    id: 'memory',
    number: 2,
    title: 'Memory & Context',
    slug: 'memory',
    description: 'Persistent context across sessions using CLAUDE.md files at project, directory, and personal levels.',
    estimatedMinutes: 45,
    lessons: makeLessons('memory', '02-memory', [
      { slug: 'overview', title: 'Memory Overview' },
      { slug: 'project-CLAUDE', title: 'Project-Level CLAUDE.md' },
      { slug: 'directory-api-CLAUDE', title: 'Directory-Level CLAUDE.md' },
      { slug: 'personal-CLAUDE', title: 'Personal CLAUDE.md' },
    ]),
  },
  {
    id: 'skills',
    number: 3,
    title: 'Agent Skills',
    slug: 'skills',
    description: 'Reusable, auto-invoked capabilities with filesystem-based progressive disclosure.',
    estimatedMinutes: 90,
    lessons: makeLessons('skills', '03-skills', [
      { slug: 'overview', title: 'Skills Overview' },
      { slug: 'code-review', title: 'Code Review Skill' },
      { slug: 'brand-voice', title: 'Brand Voice Skill' },
      { slug: 'doc-generator', title: 'Doc Generator Skill' },
      { slug: 'refactor', title: 'Refactor Skill' },
      { slug: 'claude-md', title: 'CLAUDE.md Skill' },
      { slug: 'blog-draft', title: 'Blog Draft Skill' },
    ]),
  },
  {
    id: 'subagents',
    number: 4,
    title: 'Subagents',
    slug: 'subagents',
    description: 'Specialized AI assistants with isolated context, custom permissions, and tool restrictions.',
    estimatedMinutes: 75,
    lessons: makeLessons('subagents', '04-subagents', [
      { slug: 'overview', title: 'Subagents Overview' },
      { slug: 'code-reviewer', title: 'Code Reviewer' },
      { slug: 'test-engineer', title: 'Test Engineer' },
      { slug: 'documentation-writer', title: 'Documentation Writer' },
      { slug: 'secure-reviewer', title: 'Secure Reviewer' },
      { slug: 'implementation-agent', title: 'Implementation Agent' },
      { slug: 'debugger', title: 'Debugger' },
      { slug: 'data-scientist', title: 'Data Scientist' },
      { slug: 'clean-code-reviewer', title: 'Clean Code Reviewer' },
      { slug: 'performance-optimizer', title: 'Performance Optimizer' },
    ]),
  },
  {
    id: 'mcp',
    number: 5,
    title: 'MCP (Model Context Protocol)',
    slug: 'mcp',
    description: 'Real-time access to external tools, APIs, and services via standardised protocol.',
    estimatedMinutes: 60,
    lessons: makeLessons('mcp', '05-mcp', [
      { slug: 'overview', title: 'MCP Overview' },
    ]),
  },
  {
    id: 'hooks',
    number: 6,
    title: 'Hooks & Automation',
    slug: 'hooks',
    description: 'Event-driven automation that executes on Claude Code events -- format, scan, notify.',
    estimatedMinutes: 60,
    lessons: makeLessons('hooks', '06-hooks', [
      { slug: 'overview', title: 'Hooks Overview' },
    ]),
  },
  {
    id: 'plugins',
    number: 7,
    title: 'Plugins',
    slug: 'plugins',
    description: 'Bundled collections of commands, agents, MCP servers, and hooks for complete workflows.',
    estimatedMinutes: 90,
    lessons: makeLessons('plugins', '07-plugins', [
      { slug: 'overview', title: 'Plugins Overview' },
    ]),
  },
  {
    id: 'checkpoints',
    number: 8,
    title: 'Checkpoints & Rewind',
    slug: 'checkpoints',
    description: 'Save and restore conversation state for safe experimentation and A/B testing.',
    estimatedMinutes: 30,
    lessons: makeLessons('checkpoints', '08-checkpoints', [
      { slug: 'overview', title: 'Checkpoints Overview' },
      { slug: 'checkpoint-examples', title: 'Checkpoint Examples' },
    ]),
  },
  {
    id: 'advanced',
    number: 9,
    title: 'Advanced Features',
    slug: 'advanced',
    description: 'Planning mode, extended thinking, headless CI/CD, agent teams, and power-user tools.',
    estimatedMinutes: 75,
    lessons: makeLessons('advanced', '09-advanced-features', [
      { slug: 'overview', title: 'Advanced Features Overview' },
      { slug: 'planning-mode-examples', title: 'Planning Mode Examples' },
    ]),
  },
  {
    id: 'cli',
    number: 10,
    title: 'CLI Reference',
    slug: 'cli',
    description: 'Complete command-line interface -- flags, output formats, session management, model selection.',
    estimatedMinutes: 45,
    lessons: makeLessons('cli', '10-cli', [
      { slug: 'overview', title: 'CLI Reference' },
    ]),
  },
];

// Helper to get all lesson IDs for progress calculations
export function getAllLessonIds(): string[] {
  return modules.flatMap((m) => m.lessons.map((l) => l.id));
}

// Find a module by slug
export function getModuleBySlug(slug: string): Module | undefined {
  return modules.find((m) => m.slug === slug);
}

// Find a lesson by module slug and lesson slug
export function getLessonBySlug(moduleSlug: string, lessonSlug: string): Lesson | undefined {
  const mod = getModuleBySlug(moduleSlug);
  return mod?.lessons.find((l) => l.slug === lessonSlug);
}

// Get next/previous lesson across module boundaries
export function getAdjacentLessons(moduleSlug: string, lessonSlug: string) {
  const allLessons = modules.flatMap((m) =>
    m.lessons.map((l) => ({ ...l, moduleSlug: m.slug }))
  );
  const currentIndex = allLessons.findIndex(
    (l) => l.moduleSlug === moduleSlug && l.slug === lessonSlug
  );

  return {
    previous: currentIndex > 0 ? allLessons[currentIndex - 1] : null,
    next: currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null,
  };
}

// Total estimated time
export function getTotalEstimatedMinutes(): number {
  return modules.reduce((sum, m) => sum + m.estimatedMinutes, 0);
}
