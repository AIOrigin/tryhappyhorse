import type { BreadcrumbItem } from '@/lib/seo';
import type { AppLocale } from '@/lib/i18n';
import { getSiteCopy } from '@/lib/site-copy';

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
  locale: AppLocale;
};

export function Breadcrumbs({ items, locale }: BreadcrumbsProps) {
  const copy = getSiteCopy(locale);

  return (
    <nav className="breadcrumbs" aria-label={copy.breadcrumbs.ariaLabel}>
      <ol className="breadcrumbs__list">
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1;

          return (
            <li key={item.path} className="breadcrumbs__item">
              {isCurrent ? <span aria-current="page">{item.name}</span> : <a href={item.path}>{item.name}</a>}
              {!isCurrent && <span aria-hidden="true">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
