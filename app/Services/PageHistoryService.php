<?php

namespace App\Services;

class PageHistoryService
{
    const KEY = 'page_history';
    const MAX = 100;

    /**
     * Create a new service instance.
     *
     * @return void
     */
    public function __construct($session)
    {
        $this->session = $session;
        $this->store = json_decode($this->session->get(
            PageHistoryService::KEY,
            '{"list": [], "index": -1}'
        ));
    }

    /**
     * @param string $url
     * @return null
     */
    public function put($url)
    {
        if ($this->curr() == $url) {
            return;
        }
        while (count($this->store->list) >= PageHistoryService::MAX) {
            --$this->store->index;
            array_shift($this->store->list);
        }
        while ($this->next()) {
            array_pop($this->store->list);
        }
        ++$this->store->index;
        $this->store->list[$this->store->index] = $url;
        $this->session->put(
            PageHistoryService::KEY,
            json_encode($this->store)
        );
    }

    /**
     * @return string
     */
    public function prev()
    {
        return ($this->store->index < 1)
            ? null
            : $this->store->list[$this->store->index - 1];
    }

    /**
     * @return string
     */
    public function curr()
    {
        return ($this->store->index < 0)
            ? null
            : $this->store->list[$this->store->index];
    }

    /**
     * @return string
     */
    public function next()
    {
        return (count($this->store->list) > ($this->store->index + 1))
            ? $this->store->list[$this->store->index + 1]
            : null;
    }

    /**
     * @return string
     */
    public function back()
    {
        if ($this->prev()) {
            --$this->store->index;
            $this->session->put(
                PageHistoryService::KEY,
                json_encode($this->store)
            );
        }
        return $this->curr();
    }

    /**
     * @return string
     */
    public function forward()
    {
        if ($this->next()) {
            ++$this->store->index;
            $this->session->put(
                PageHistoryService::KEY,
                json_encode($this->store)
            );
        }
        return $this->curr();
    }
}
