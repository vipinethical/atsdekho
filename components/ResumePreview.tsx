import type { ReactNode } from "react";
import type { ExperienceItem, RewrittenResume } from "@/lib/types";
import { sameText } from "@/lib/dedupe";
import { contactBits, formatDates } from "@/lib/resume-format";

type ResumePreviewProps = {
  resume: RewrittenResume;
  editing?: boolean;
  onChange?: (next: RewrittenResume) => void;
};

export function ResumePreview({ resume, editing = false, onChange }: ResumePreviewProps) {
  const bits = contactBits(resume.contactLine);
  const patch = (next: Partial<RewrittenResume>) => {
    onChange?.({ ...resume, ...next });
  };

  return (
    <article className="border border-line bg-white px-8 py-9 text-[#1c1917] sm:px-11">
      <header className="border-b border-[#1c1917] pb-4 text-center">
        <Field
          editing={editing}
          value={resume.name}
          ariaLabel="Name"
          placeholder="Your name"
          align="center"
          className="text-[1.65rem] font-semibold tracking-[0.12em] uppercase"
          onChange={(name) => patch({ name })}
        />
        {(editing || resume.headline) ? (
          <Field
            editing={editing}
            value={resume.headline}
            ariaLabel="Headline"
            placeholder="Headline, e.g. Frontend Developer"
            align="center"
            className="mt-1.5 text-[13px] tracking-wide"
            onChange={(headline) => patch({ headline })}
          />
        ) : null}
        {(editing || bits.length) ? (
          <Field
            editing={editing}
            value={resume.contactLine}
            ariaLabel="Contact"
            placeholder="City  ·  phone  ·  email"
            align="center"
            className="mt-2 text-[12px] leading-5 text-[#44403c]"
            onChange={(contactLine) => patch({ contactLine })}
          />
        ) : null}
      </header>

      <Section title="Professional Summary">
        <Field
          editing={editing}
          value={resume.summary}
          ariaLabel="Professional summary"
          placeholder="Two or three lines on what you have actually shipped."
          multiline
          className="text-[13px] leading-6"
          onChange={(summary) => patch({ summary })}
        />
      </Section>

      {(editing || resume.skills.length) ? (
        <Section title="Key Skills">
          <Field
            editing={editing}
            value={resume.skills.join(", ")}
            ariaLabel="Key skills"
            placeholder="React, JavaScript, TypeScript"
            multiline
            className="text-[13px] leading-6"
            onChange={(value) =>
              patch({
                skills: value.split(",").map((skill) => skill.replace(/^\s+/, "")),
              })
            }
          />
        </Section>
      ) : null}

      {(editing || resume.experience.length) ? (
        <Section title="Professional Experience">
          <div className="space-y-4">
            {resume.experience.map((job, jobIndex) => (
              <div key={jobIndex}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
                  <Field
                    editing={editing}
                    value={job.company}
                    ariaLabel={`Company ${jobIndex + 1}`}
                    placeholder="Company"
                    className="min-w-[12rem] flex-1 text-[13px] font-semibold"
                    onChange={(company) =>
                      patchJob(resume, onChange, jobIndex, { company })
                    }
                  />
                  {(editing || job.dates) ? (
                    <Field
                      editing={editing}
                      value={job.dates}
                      ariaLabel={`Dates ${jobIndex + 1}`}
                      placeholder="Jan 2022 – Present"
                      align="right"
                      className="text-[12px] text-[#44403c]"
                      onChange={(dates) =>
                        patchJob(resume, onChange, jobIndex, { dates })
                      }
                    />
                  ) : null}
                </div>
                {(editing || (job.title && !sameText(job.title, job.company))) ? (
                  <Field
                    editing={editing}
                    value={job.title}
                    ariaLabel={`Title ${jobIndex + 1}`}
                    placeholder="Job title"
                    className="text-[13px] italic text-[#44403c]"
                    onChange={(title) =>
                      patchJob(resume, onChange, jobIndex, { title })
                    }
                  />
                ) : null}
                <ul className="mt-1.5 list-disc space-y-1 pl-5 text-[13px] leading-5">
                  {job.bullets.map((line, bulletIndex) => (
                    <li key={bulletIndex} className="pr-16 relative">
                      <Field
                        editing={editing}
                        value={line}
                        ariaLabel={`Bullet ${jobIndex + 1}.${bulletIndex + 1}`}
                        placeholder="What you shipped"
                        multiline
                        className="text-[13px] leading-5"
                        onChange={(bullet) =>
                          patchBullet(resume, onChange, jobIndex, bulletIndex, bullet)
                        }
                      />
                      {editing ? (
                        <Ghost
                          className="absolute right-0 top-0"
                          onClick={() =>
                            patchJob(resume, onChange, jobIndex, {
                              bullets: job.bullets.filter((_, i) => i !== bulletIndex),
                            })
                          }
                        >
                          Remove
                        </Ghost>
                      ) : null}
                    </li>
                  ))}
                </ul>
                {editing ? (
                  <div className="mt-2 flex flex-wrap gap-3">
                    <Ghost
                      onClick={() =>
                        patchJob(resume, onChange, jobIndex, {
                          bullets: [...job.bullets, ""],
                        })
                      }
                    >
                      Add bullet
                    </Ghost>
                    <Ghost
                      onClick={() =>
                        patch({
                          experience: resume.experience.filter((_, i) => i !== jobIndex),
                        })
                      }
                    >
                      Remove role
                    </Ghost>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
          {editing ? (
            <Ghost
              className="mt-3"
              onClick={() =>
                patch({
                  experience: [...resume.experience, emptyJob()],
                })
              }
            >
              Add role
            </Ghost>
          ) : null}
        </Section>
      ) : null}

      {(editing || resume.education.length) ? (
        <Section title="Education">
          {resume.education.map((edu, index) => (
            <div key={index} className="relative pr-16">
              <Field
                editing={editing}
                value={edu.line}
                ariaLabel={`Education ${index + 1}`}
                placeholder="B.Tech, Computer Science — 2019"
                className="text-[13px] leading-6"
                onChange={(line) =>
                  patch({
                    education: resume.education.map((item, i) =>
                      i === index ? { ...item, line } : item,
                    ),
                  })
                }
              />
              {editing ? (
                <Ghost
                  className="absolute right-0 top-0"
                  onClick={() =>
                    patch({
                      education: resume.education.filter((_, i) => i !== index),
                    })
                  }
                >
                  Remove
                </Ghost>
              ) : null}
            </div>
          ))}
          {editing ? (
            <Ghost
              className="mt-2"
              onClick={() =>
                patch({
                  education: [
                    ...resume.education,
                    { line: "", degree: null, year: null },
                  ],
                })
              }
            >
              Add education
            </Ghost>
          ) : null}
        </Section>
      ) : null}

      {resume.projects.length ? (
        <Section title="Projects">
          {resume.projects.map((project, index) => (
            <div key={index} className="mb-2 relative pr-16">
              <Field
                editing={editing}
                value={project.name}
                ariaLabel={`Project ${index + 1}`}
                placeholder="Project name"
                className="text-[13px] font-semibold"
                onChange={(name) =>
                  patch({
                    projects: resume.projects.map((item, i) =>
                      i === index ? { ...item, name } : item,
                    ),
                  })
                }
              />
              {editing ? (
                <Ghost
                  className="absolute right-0 top-0"
                  onClick={() =>
                    patch({
                      projects: resume.projects.filter((_, i) => i !== index),
                    })
                  }
                >
                  Remove
                </Ghost>
              ) : null}
            </div>
          ))}
          {editing ? (
            <Ghost
              className="mt-1"
              onClick={() =>
                patch({
                  projects: [...resume.projects, { name: "", bullets: [] }],
                })
              }
            >
              Add project
            </Ghost>
          ) : null}
        </Section>
      ) : editing ? (
        <Ghost
          className="mt-4"
          onClick={() =>
            patch({
              projects: [...resume.projects, { name: "", bullets: [] }],
            })
          }
        >
          Add project
        </Ghost>
      ) : null}

      {resume.certifications.length ? (
        <Section title="Certifications">
          {resume.certifications.map((cert, index) => (
            <div key={index} className="relative pr-16">
              <Field
                editing={editing}
                value={cert}
                ariaLabel={`Certification ${index + 1}`}
                placeholder="AWS Certified Solutions Architect"
                className="text-[13px] leading-6"
                onChange={(line) =>
                  patch({
                    certifications: resume.certifications.map((item, i) =>
                      i === index ? line : item,
                    ),
                  })
                }
              />
              {editing ? (
                <Ghost
                  className="absolute right-0 top-0"
                  onClick={() =>
                    patch({
                      certifications: resume.certifications.filter((_, i) => i !== index),
                    })
                  }
                >
                  Remove
                </Ghost>
              ) : null}
            </div>
          ))}
          {editing ? (
            <Ghost
              className="mt-2"
              onClick={() => patch({ certifications: [...resume.certifications, ""] })}
            >
              Add certification
            </Ghost>
          ) : null}
        </Section>
      ) : editing ? (
        <Ghost
          className="mt-3"
          onClick={() => patch({ certifications: [...resume.certifications, ""] })}
        >
          Add certification
        </Ghost>
      ) : null}
    </article>
  );
}

function emptyJob(): ExperienceItem {
  return {
    company: "",
    title: "",
    dates: "",
    bullets: [""],
    dateParsed: false,
  };
}

function patchJob(
  resume: RewrittenResume,
  onChange: ResumePreviewProps["onChange"],
  index: number,
  partial: Partial<ExperienceItem>,
) {
  onChange?.({
    ...resume,
    experience: resume.experience.map((job, i) =>
      i === index ? { ...job, ...partial } : job,
    ),
  });
}

function patchBullet(
  resume: RewrittenResume,
  onChange: ResumePreviewProps["onChange"],
  jobIndex: number,
  bulletIndex: number,
  value: string,
) {
  const job = resume.experience[jobIndex];
  if (!job) return;
  patchJob(resume, onChange, jobIndex, {
    bullets: job.bullets.map((line, i) => (i === bulletIndex ? value : line)),
  });
}

function Field({
  value,
  editing,
  onChange,
  className,
  placeholder,
  ariaLabel,
  multiline = false,
  align = "left",
}: {
  value: string;
  editing: boolean;
  onChange: (value: string) => void;
  className: string;
  placeholder: string;
  ariaLabel: string;
  multiline?: boolean;
  align?: "left" | "center" | "right";
}) {
  if (!editing) {
    if (!value) return null;
    if (align === "center" && className.includes("uppercase")) {
      return <h2 className={className}>{value}</h2>;
    }
    return <p className={className}>{align === "left" ? value : formatRead(value, ariaLabel)}</p>;
  }

  const alignClass =
    align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left";
  const shared = `${className} ${alignClass} w-full rounded-sm bg-transparent px-0 py-0 outline-none ring-0 placeholder:text-[#a8a29e] focus:bg-[#f8f1e8]`;

  if (multiline) {
    return (
      <textarea
        aria-label={ariaLabel}
        value={value}
        placeholder={placeholder}
        rows={Math.max(2, Math.min(8, value.split("\n").length + 1))}
        onChange={(event) => onChange(event.target.value)}
        className={`${shared} resize-y`}
      />
    );
  }

  return (
    <input
      aria-label={ariaLabel}
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      className={shared}
    />
  );
}

function formatRead(value: string, ariaLabel: string) {
  if (ariaLabel.toLowerCase().includes("dates")) return formatDates(value);
  return value;
}

function Ghost({
  children,
  onClick,
  className = "",
}: {
  children: ReactNode;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-[11px] tracking-wide text-accent hover:underline ${className}`}
    >
      {children}
    </button>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-5">
      <h3 className="border-b border-[#1c1917]/80 pb-1 text-[11px] font-semibold uppercase tracking-[0.16em]">
        {title}
      </h3>
      <div className="mt-2">{children}</div>
    </section>
  );
}
