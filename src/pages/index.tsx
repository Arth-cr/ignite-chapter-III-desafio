import { GetStaticProps } from 'next';
import Header from '../components/Header';

import { FiCalendar, FiUser } from 'react-icons/fi';

import { getPrismicClient } from '../services/prismic';
import * as prismic from '@prismicio/client';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import Link from 'next/link';
import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Head from 'next/head';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const formattedPost = postsPagination.results.map(post => {
    return {
      ...post,
      first_publication_date: format(
        new Date(post.first_publication_date),
        'dd MMM yyy',
        {
          locale: ptBR,
        }
      ),
    };
  });
  const [posts, setPosts] = useState<Post[]>(formattedPost);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);
  const [currentPage, setCurrentPage] = useState(1);

  async function handleNextPage(): Promise<void> {
    if (currentPage !== 1 && nextPage === null) {
      return;
    }

    const postResults = await fetch(`${nextPage}`).then(response =>
      response.json()
    );

    setNextPage(postResults.next_page);
    setCurrentPage(postResults.page);

    const newPosts = postResults.results.map(post => {
      return {
        uid: post.uid,
        first_publication_date: format(
          new Date(post.first_publication_date),
          'dd MMM yyy',
          {
            locale: ptBR,
          }
        ),
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author,
        },
      };
    });

    setPosts([...posts, ...newPosts]);
  }

  console.log(posts);

  return (
    <>
      <Head>Home | SpaceTraveling</Head>
      <main className={commonStyles.container}>
        <Header />

        <div className={styles.posts}>
          {posts.map(post => {
            return (
              <Link href={`/post/${post.uid}`} key={post.uid}>
                <a className={styles.post}>
                  <strong>{post.data.title}</strong>
                  <p>{post.data.subtitle}</p>

                  <ul>
                    <li>
                      <FiCalendar />
                      {post.first_publication_date}
                    </li>
                    <li>
                      <FiUser />
                      {post.data.author}
                    </li>
                  </ul>
                </a>
              </Link>
            );
          })}

          {nextPage && (
            <button type="button" onClick={handleNextPage}>
              Carregar mais posts
            </button>
          )}
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const client = getPrismicClient();
  const postsResponse = await client.get({
    // método query está desatualizado, utilizar só para fim de teste (usar get ao invés de query)
    predicates: prismic.predicate.at('document.type', 'slug'),

    pageSize: 1,
  });

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: posts,
  };

  return {
    props: {
      postsPagination,
    },
  };
};
