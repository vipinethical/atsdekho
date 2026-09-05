import type { TextItem } from "./types";

export const SAMPLE_JD = `Job Title: Senior Java Backend Engineer
Company: FinEdge Technologies Pvt Ltd
Location: Bengaluru / Hybrid
Experience: 4 - 7 years
CTC: 18-28 LPA
Notice Period: 30 days or less preferred

Must have:
- Strong Java, Spring Boot, Microservices
- Kafka, Redis, MySQL
- REST APIs, System Design
- AWS
- Git, Jenkins, CI/CD

Good to have:
- Kubernetes, Docker
- Prometheus, Grafana
- Kafka Streams

Education: B.E. / B.Tech (CS/IT preferred)

Responsibilities:
- Design and build backend services for lending workflows
- Own APIs consumed by the customer app and internal ops
- Improve reliability, latency, and on-call hygiene
`;

export const SAMPLE_RESUME_TEXT = `PRIYA SHARMA                    KEY SKILLS
Bengaluru                       Java
                                Spring Boot
SOFTWARE ENGINEER               Microservices
5 years                         MySQL
                                Git

WHAT I BRING
Backend engineer who likes messy lending workflows.

WHERE I'VE WORKED
FinServe Labs | Senior Software Engineer | Jan 2022 - Present
- Built Spring Boot microservices for loan origination used by 40+ ops users
- REST APIs over MySQL; added Redis caching on the eligibility path
- Jenkins CI/CD; on-call for the disbursal service
- Worked with Kafka for notification fan-out (producer + consumer)

NovaRetail | Software Engineer | Jul 2019 - Dec 2021
- Java services for order and inventory; Git + Maven
- Wrote integration tests and helped the team move off a monolith

ACADEMICS
B.Tech, Computer Science, VTU — 2019

MY TOOLKIT
Spring, REST, SQL, Jira, Agile

DECLARATION
I hereby declare that the information above is true to the best of my knowledge.
Father's name: Rajesh Sharma
Passport: available on request
`;

function item(
  str: string,
  x: number,
  y: number,
  width = Math.max(40, str.length * 6),
): TextItem {
  return { str, x, y, width, height: 11, page: 1 };
}

export const SAMPLE_ITEMS: TextItem[] = [
  item("PRIYA SHARMA", 40, 760, 160),
  item("KEY SKILLS", 340, 760, 90),
  item("Bengaluru", 40, 742, 80),
  item("Java", 340, 742, 40),
  item("SOFTWARE ENGINEER", 40, 724, 150),
  item("Spring Boot", 340, 724, 80),
  item("5 years", 40, 706, 60),
  item("Microservices", 340, 706, 90),
  item("priya.sharma@gmail.com", 40, 688, 160),
  item("MySQL", 340, 688, 50),
  item("+91 98765 43210", 40, 670, 110),
  item("Git", 340, 670, 30),
  item("Jenkins", 340, 652, 55),
  item("WHAT I BRING", 40, 620, 110),
  item("Backend engineer who likes messy lending workflows.", 40, 602, 360),
  item("WHERE I'VE WORKED", 40, 568, 150),
  item("FinServe Labs | Senior Software Engineer | Jan 2022 - Present", 40, 550, 400),
  item("Built Spring Boot microservices for loan origination used by 40+ ops users", 48, 532, 420),
  item("REST APIs over MySQL; added Redis caching on the eligibility path", 48, 514, 400),
  item("Jenkins CI/CD; on-call for the disbursal service", 48, 496, 320),
  item("Worked with Kafka for notification fan-out (producer + consumer)", 48, 478, 400),
  item("NovaRetail | Software Engineer | Jul 2019 - Dec 2021", 40, 450, 360),
  item("Java services for order and inventory; Git + Maven", 48, 432, 340),
  item("Wrote integration tests and helped the team move off a monolith", 48, 414, 380),
  item("ACADEMICS", 40, 380, 90),
  item("B.Tech, Computer Science, VTU — 2019", 40, 362, 260),
  item("MY TOOLKIT", 40, 328, 90),
  item("Spring, REST, SQL, Jira, Agile", 40, 310, 220),
  item("DECLARATION", 40, 276, 100),
  item("I hereby declare that the information above is true.", 40, 258, 360),
  item("Father's name: Rajesh Sharma", 40, 240, 200),
];
