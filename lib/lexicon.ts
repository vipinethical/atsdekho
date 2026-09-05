export const PORTALS: { id: "naukri" | "iimjobs" | "linkedin"; label: string; blurb: string }[] =
  [
    {
      id: "naukri",
      label: "Naukri",
      blurb: "Line-by-line Word/PDF parser. Two columns and tables get scrambled. Prefers .docx under 2MB.",
    },
    {
      id: "iimjobs",
      label: "IIMJobs / Hirist",
      blurb: "Clean chronological extract. Education and metrics in bullets matter more than a photo-led CV.",
    },
    {
      id: "linkedin",
      label: "LinkedIn",
      blurb: "Easy Apply often uses your profile, not the PDF. Recruiter still keyword-matches the uploaded file.",
    },
  ];

export const CITIES = [
  "bengaluru",
  "bangalore",
  "hyderabad",
  "pune",
  "mumbai",
  "navi mumbai",
  "delhi",
  "new delhi",
  "gurgaon",
  "gurugram",
  "noida",
  "greater noida",
  "chennai",
  "kolkata",
  "ahmedabad",
  "jaipur",
  "kochi",
  "coimbatore",
  "indore",
  "chandigarh",
  "thiruvananthapuram",
  "vadodara",
  "surat",
  "nagpur",
  "lucknow",
  "remote",
  "hybrid",
];

export const DEGREES = [
  "b.tech",
  "b.e.",
  "be",
  "btech",
  "b.e",
  "m.tech",
  "m.e.",
  "mca",
  "bca",
  "mba",
  "pgdm",
  "b.com",
  "b.com.",
  "m.com",
  "b.sc",
  "m.sc",
  "phd",
  "ph.d",
  "ca",
  "cfa",
  "bba",
];

export const SKILLS = [
  "Spring Boot",
  "Spring Cloud",
  "Spring MVC",
  "System Design",
  "Microservices",
  "REST APIs",
  "REST API",
  "GraphQL",
  "Apache Kafka",
  "Kafka Streams",
  "Kafka",
  "RabbitMQ",
  "ActiveMQ",
  "Redis",
  "Memcached",
  "MongoDB",
  "PostgreSQL",
  "MySQL",
  "Oracle",
  "SQL Server",
  "DynamoDB",
  "Cassandra",
  "Elasticsearch",
  "OpenSearch",
  "Hibernate",
  "JPA",
  "MyBatis",
  "JUnit",
  "Mockito",
  "Selenium",
  "Cypress",
  "Playwright",
  "Jenkins",
  "GitHub Actions",
  "GitLab CI",
  "Azure DevOps",
  "CircleCI",
  "CI/CD",
  "Docker",
  "Kubernetes",
  "Helm",
  "Terraform",
  "Ansible",
  "AWS",
  "Azure",
  "GCP",
  "EC2",
  "S3",
  "Lambda",
  "RDS",
  "SQS",
  "SNS",
  "Prometheus",
  "Grafana",
  "ELK",
  "Splunk",
  "New Relic",
  "Datadog",
  "Linux",
  "Bash",
  "Shell scripting",
  "Git",
  "Maven",
  "Gradle",
  "Node.js",
  "Express",
  "NestJS",
  "React",
  "Next.js",
  "Angular",
  "Vue",
  "TypeScript",
  "JavaScript",
  "HTML",
  "CSS",
  "Tailwind",
  "Redux",
  "React Native",
  "Flutter",
  "Kotlin",
  "Swift",
  "Android",
  "iOS",
  "Python",
  "Django",
  "Flask",
  "FastAPI",
  "Pandas",
  "NumPy",
  "Power BI",
  "Tableau",
  "Excel",
  "Looker",
  "Salesforce",
  "SAP",
  "Tally",
  "GST",
  "ServiceNow",
  "Jira",
  "Confluence",
  "Agile",
  "Scrum",
  "Java",
  "C++",
  "C#",
  ".NET",
  "Go",
  "Golang",
  "Ruby",
  "Rails",
  "PHP",
  "Laravel",
  "DSA",
  "Data Structures",
  "OOP",
  "OOPs",
  "Multithreading",
  "Concurrency",
  "gRPC",
  "Protobuf",
  "OAuth",
  "JWT",
  "SSO",
  "Okta",
  "Figma",
  "Product Management",
  "SQL",
];

export const SECTION_MAP: { match: RegExp; canonical: import("./types").DetectedSection["canonical"]; standard: boolean }[] =
  [
    {
      match: /^(professional\s+)?summary$|^career\s+objective$|^objective$|^profile$|^about\s+me$|^career\s+profile$/i,
      canonical: "summary",
      standard: true,
    },
    {
      match: /^what i bring$|^who i am$/i,
      canonical: "summary",
      standard: false,
    },
    {
      match: /^(key\s+)?(technical\s+)?skills$|^core\s+competenc|^it\s+skills$|^technical\s+proficiency$|^tools\s+(&|and)\s+technolog/i,
      canonical: "skills",
      standard: true,
    },
    {
      match: /^my toolkit$/i,
      canonical: "skills",
      standard: false,
    },
    {
      match: /^(professional|work|employment|career)?\s*(experience|history)$|^experience$|^work\s+history$|^employment$/i,
      canonical: "experience",
      standard: true,
    },
    {
      match: /^where i'?ve? worked$|^selected work$|^work$/i,
      canonical: "experience",
      standard: false,
    },
    {
      match: /^education$|^academic|^qualifications?$|^educational|^academics$/i,
      canonical: "education",
      standard: true,
    },
    {
      match: /^projects?$|^academic\s+projects?$|^personal\s+projects?$/i,
      canonical: "projects",
      standard: true,
    },
    {
      match: /^certifications?$|^certificates$|^courses?$|^trainings?$/i,
      canonical: "certifications",
      standard: true,
    },
    {
      match: /^personal\s+(details|information)$|^declaration$|^hobbies$|^interests$|^languages$|^passport/i,
      canonical: "personal",
      standard: false,
    },
    {
      match: /^highlights$/i,
      canonical: "other",
      standard: false,
    },
  ];

export function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function findSkills(text: string): string[] {
  const found: string[] = [];
  const sorted = [...SKILLS].sort((a, b) => b.length - a.length);
  const used = new Set<string>();
  for (const skill of sorted) {
    const pattern = new RegExp(
      `(^|[^A-Za-z0-9+#])${escapeRegExp(skill)}(?=$|[^A-Za-z0-9+#])`,
      "i",
    );
    if (pattern.test(text) && !used.has(skill.toLowerCase())) {
      found.push(skill);
      used.add(skill.toLowerCase());
    }
  }
  return found;
}

export function findCities(text: string): string | null {
  const lower = text.toLowerCase();
  for (const city of CITIES) {
    if (lower.includes(city)) {
      if (city === "bangalore") return "Bengaluru";
      if (city === "gurgaon") return "Gurugram";
      return city.replace(/\b\w/g, (c) => c.toUpperCase());
    }
  }
  return null;
}
