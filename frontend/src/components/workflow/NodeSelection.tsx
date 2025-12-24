export function NodeSection({
    title,
    nodes,
    onAdd,
  }: {
    title: string;
    nodes: {
      id: string;
      label: string;
      desc: string;
      group?: string;
      styles?: { color: string; borderClass: string; backgroundClass: string };
    }[];
    onAdd: (node: {
      id: string;
      label: string;
      desc: string;
      group?: string;
      styles?: { color: string; borderClass: string; backgroundClass: string };
    }) => void;
  }) {
    return (
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">
          {title}
        </h4>
  
        <div className="space-y-2">
          {nodes.map((node) => (
            <button
              key={node.id}
              onClick={() => onAdd(node)}
              className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition cursor-pointer"
            >
              <div className="font-medium text-sm">{node.label}</div>
              <div className="text-xs text-gray-500">{node.desc}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }
  