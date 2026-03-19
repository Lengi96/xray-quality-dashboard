'use client'

interface Project {
  id: string
  name: string
  externalId: string
}

interface ProjectSelectorProps {
  projects: Project[]
  selectedProjectId: string | null
}

export function ProjectSelector({ projects, selectedProjectId }: ProjectSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
      <form method="get">
        <select
          name="projectId"
          defaultValue={selectedProjectId ?? ''}
          onChange={(e) => {
            const form = (e.target as HTMLSelectElement).closest('form') as HTMLFormElement
            form?.submit()
          }}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.externalId})
            </option>
          ))}
        </select>
      </form>
    </div>
  )
}
